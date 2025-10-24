-- Fix search_path for all security definer functions
CREATE OR REPLACE FUNCTION notify_friends_new_tip()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION notify_tip_owner_comment()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, related_user_id)
    VALUES (
      NEW.addressee_id,
      'friend_request_received',
      'Ny venneforespørsel',
      (SELECT COALESCE(display_name, username, 'Noen') FROM profiles WHERE user_id = NEW.requester_id) || ' sendte deg en venneforespørsel',
      NEW.requester_id
    );
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;