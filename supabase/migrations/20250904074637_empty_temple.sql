/*
  # Add notifications system and GDPR compliance

  1. New Tables
    - `notifications` - Store user notifications
    - `gdpr_consents` - Track user consent for data processing
    - `data_deletion_requests` - Track deletion requests

  2. Notification Types
    - friend_request_received
    - friend_request_accepted
    - tip_liked
    - tip_commented
    - tip_shared

  3. GDPR Features
    - Consent tracking
    - Data deletion requests
    - Privacy policy acceptance

  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user access
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('friend_request_received', 'friend_request_accepted', 'tip_liked', 'tip_commented', 'tip_shared', 'message_received')),
  title text NOT NULL,
  message text NOT NULL,
  related_user_id uuid,
  related_tip_id uuid,
  related_conversation_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create GDPR consents table
CREATE TABLE IF NOT EXISTS public.gdpr_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  data_processing_consent boolean NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  analytics_consent boolean NOT NULL DEFAULT false,
  privacy_policy_version text NOT NULL DEFAULT '1.0',
  consent_date timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create data deletion requests table
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- GDPR consents policies
CREATE POLICY "Users can view their own consent"
ON public.gdpr_consents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent"
ON public.gdpr_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent"
ON public.gdpr_consents
FOR UPDATE
USING (auth.uid() = user_id);

-- Data deletion requests policies
CREATE POLICY "Users can view their own deletion requests"
ON public.data_deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
ON public.data_deletion_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gdpr_consents_updated_at
  BEFORE UPDATE ON public.gdpr_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_user_id uuid DEFAULT NULL,
  p_related_tip_id uuid DEFAULT NULL,
  p_related_conversation_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_tip_id,
    related_conversation_id
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_related_user_id,
    p_related_tip_id,
    p_related_conversation_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to handle new user GDPR setup
CREATE OR REPLACE FUNCTION public.handle_new_user_gdpr()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create GDPR consent record for new user
  INSERT INTO public.gdpr_consents (
    user_id,
    data_processing_consent,
    privacy_policy_version
  ) VALUES (
    NEW.id,
    true, -- They must have consented to sign up
    '1.0'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user GDPR setup
CREATE TRIGGER on_auth_user_created_gdpr
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_gdpr();

-- Triggers for automatic notifications
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name text;
BEGIN
  -- Get requester's display name
  SELECT COALESCE(display_name, username, 'En bruker')
  INTO requester_name
  FROM public.profiles
  WHERE user_id = NEW.requester_id;

  -- Create notification for addressee
  PERFORM public.create_notification(
    NEW.addressee_id,
    'friend_request_received',
    'Ny venneforespørsel',
    requester_name || ' har sendt deg en venneforespørsel',
    NEW.requester_id
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_friend_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepter_name text;
BEGIN
  -- Only notify when status changes to accepted
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    -- Get accepter's display name
    SELECT COALESCE(display_name, username, 'En bruker')
    INTO accepter_name
    FROM public.profiles
    WHERE user_id = NEW.addressee_id;

    -- Create notification for requester
    PERFORM public.create_notification(
      NEW.requester_id,
      'friend_request_accepted',
      'Venneforespørsel godtatt',
      accepter_name || ' godtok din venneforespørsel',
      NEW.addressee_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_tip_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  liker_name text;
  tip_title text;
  tip_owner_id uuid;
BEGIN
  -- Get tip owner and title
  SELECT user_id, title
  INTO tip_owner_id, tip_title
  FROM public.tips
  WHERE id = NEW.tip_id;

  -- Don't notify if user likes their own tip
  IF tip_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker's display name
  SELECT COALESCE(display_name, username, 'En bruker')
  INTO liker_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification for tip owner
  PERFORM public.create_notification(
    tip_owner_id,
    'tip_liked',
    'Noen likte tipset ditt',
    liker_name || ' likte "' || tip_title || '"',
    NEW.user_id,
    NEW.tip_id
  );

  RETURN NEW;
END;
$$;

-- Create triggers for notifications
CREATE TRIGGER trigger_notify_friend_request
  AFTER INSERT ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_request();

CREATE TRIGGER trigger_notify_friend_accepted
  AFTER UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_accepted();

CREATE TRIGGER trigger_notify_tip_liked
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_tip_liked();