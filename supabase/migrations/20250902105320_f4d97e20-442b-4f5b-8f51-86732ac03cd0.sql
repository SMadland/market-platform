-- Fix RLS policy for profiles to allow viewing other users' profiles (needed for avatars in chats)
DROP POLICY IF EXISTS "Profiles: owner access" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create a direct messages system (replacing groups)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id uuid NOT NULL,
  participant2_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  tip_id uuid REFERENCES public.tips(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.conversation_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = conversation_messages.conversation_id 
  AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
));

CREATE POLICY "Users can send messages to their conversations" 
ON public.conversation_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_messages.conversation_id 
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.conversation_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.conversation_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();