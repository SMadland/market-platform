/*
  # Fix RLS infinite recursion for group_members

  1. Security Function
    - Create `get_user_group_ids` function with SECURITY DEFINER to bypass RLS
    - Returns all group IDs a user is a member of

  2. Updated Policies
    - Replace recursive policies with function-based policies
    - Fix policies for group_members, group_messages, and groups tables
*/

-- Create a security definer function to get user's group IDs
CREATE OR REPLACE FUNCTION get_user_group_ids(user_id UUID)
RETURNS TABLE(group_id UUID)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE gm.user_id = $1;
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view group members for groups they are in" ON public.group_members;
DROP POLICY IF EXISTS "Users can view messages in groups they are members of" ON public.group_messages;
DROP POLICY IF EXISTS "Users can send messages to groups they are members of" ON public.group_messages;

-- Create new policies using the security definer function
CREATE POLICY "Users can view group members for groups they are in"
ON public.group_members 
FOR SELECT 
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);

CREATE POLICY "Users can view messages in groups they are members of"
ON public.group_messages 
FOR SELECT 
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);

CREATE POLICY "Users can send messages to groups they are members of"
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);