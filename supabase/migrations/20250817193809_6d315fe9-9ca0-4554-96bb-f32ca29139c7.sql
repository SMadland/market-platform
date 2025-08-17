-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  tip_id UUID REFERENCES public.tips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.groups 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group members for groups they are in"
ON public.group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm2 
    WHERE gm2.group_id = group_members.group_id 
    AND gm2.user_id = auth.uid()
  )
);

CREATE POLICY "Group creators can add members"
ON public.group_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave groups"
ON public.group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for group_messages
CREATE POLICY "Users can view messages in groups they are members of"
ON public.group_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to groups they are members of"
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.group_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.group_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at
BEFORE UPDATE ON public.group_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();