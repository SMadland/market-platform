-- Create function to notify friends when a new tip is created
CREATE OR REPLACE FUNCTION notify_friends_new_tip()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for all friends of the user who created the tip
  INSERT INTO notifications (user_id, type, title, message, related_user_id, related_tip_id)
  SELECT 
    CASE 
      WHEN f.requester_id = NEW.user_id THEN f.addressee_id
      ELSE f.requester_id
    END as friend_id,
    'new_tip_from_friend',
    'Nytt tips fra en venn',
    (SELECT COALESCE(display_name, username, 'En venn') FROM profiles WHERE user_id = NEW.user_id) || ' delte et nytt tips: ' || NEW.title,
    NEW.user_id,
    NEW.id
  FROM friendships f
  WHERE 
    f.status = 'accepted' 
    AND (f.requester_id = NEW.user_id OR f.addressee_id = NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new tips
DROP TRIGGER IF EXISTS on_tip_created ON tips;
CREATE TRIGGER on_tip_created
  AFTER INSERT ON tips
  FOR EACH ROW
  EXECUTE FUNCTION notify_friends_new_tip();

-- Create function to notify when someone comments on user's tip
CREATE OR REPLACE FUNCTION notify_tip_owner_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if commenter is not the tip owner
  IF NEW.user_id != (SELECT user_id FROM tips WHERE id = NEW.tip_id) THEN
    INSERT INTO notifications (user_id, type, title, message, related_user_id, related_tip_id)
    SELECT 
      t.user_id,
      'tip_commented',
      'Ny kommentar på ditt tips',
      (SELECT COALESCE(display_name, username, 'Noen') FROM profiles WHERE user_id = NEW.user_id) || ' kommenterte på ditt tips: ' || t.title,
      NEW.user_id,
      NEW.tip_id
    FROM tips t
    WHERE t.id = NEW.tip_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS on_comment_created ON comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_tip_owner_comment();

-- Create function to notify when friend request is received
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on new pending requests
  IF NEW.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, related_user_id)
    VALUES (
      NEW.addressee_id,
      'friend_request_received',
      'Ny venneforespørsel',
      (SELECT COALESCE(display_name, username, 'Noen') FROM profiles WHERE user_id = NEW.requester_id) || ' sendte deg en venneforespørsel',
      NEW.requester_id
    );
  -- Notify when request is accepted
  ELSIF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, related_user_id)
    VALUES (
      NEW.requester_id,
      'friend_request_accepted',
      'Venneforespørsel godtatt',
      (SELECT COALESCE(display_name, username, 'Noen') FROM profiles WHERE user_id = NEW.addressee_id) || ' godtok venneforespørselen din',
      NEW.addressee_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for friend requests
DROP TRIGGER IF EXISTS on_friendship_change ON friendships;
CREATE TRIGGER on_friendship_change
  AFTER INSERT OR UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- Create function to notify when new message is received
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the other participant in the conversation
  INSERT INTO notifications (user_id, type, title, message, related_user_id, related_conversation_id)
  SELECT 
    CASE 
      WHEN c.participant1_id = NEW.user_id THEN c.participant2_id
      ELSE c.participant1_id
    END as recipient_id,
    'message_received',
    'Ny melding',
    (SELECT COALESCE(display_name, username, 'Noen') FROM profiles WHERE user_id = NEW.user_id) || ' sendte deg en melding',
    NEW.user_id,
    NEW.conversation_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_message_created ON conversation_messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();