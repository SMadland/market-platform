-- Create reactions table for tip reactions
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'useful', 'love', 'celebration')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tip_id)
);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all reactions"
ON public.reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reactions"
ON public.reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.reactions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
ON public.reactions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_reactions_tip_id ON public.reactions(tip_id);
CREATE INDEX idx_reactions_user_id ON public.reactions(user_id);