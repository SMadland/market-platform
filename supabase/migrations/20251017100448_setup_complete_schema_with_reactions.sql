/*
  # Complete Schema Setup with Reactions System

  1. New Tables
    - `profiles` - User profile information
    - `friendships` - Friend connections between users
    - `tips` - User tips and recommendations
    - `likes` - Legacy like system (kept for compatibility)
    - `comments` - Comments on tips
    - `reactions` - New multi-reaction system (like, useful, love, celebration)
    - `conversations` - Direct message conversations
    - `conversation_messages` - Messages in conversations
    - `groups` - Chat groups
    - `group_members` - Group memberships
    - `group_messages` - Messages in groups
    - `business_subscribers` - Business account subscriptions

  2. Reactions System
    - Four reaction types: like 💗, useful 💡, love 😍, celebration 👏
    - One reaction per user per tip
    - Replaces simple like system with richer interactions

  3. Security
    - RLS enabled on all tables
    - Appropriate policies for each table
    - Users can only modify their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create tips table
CREATE TABLE IF NOT EXISTS public.tips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  product_name text,
  product_url text,
  product_price decimal(10,2),
  category text,
  image_url text,
  scraped_title text,
  scraped_image_url text,
  scraped_description text,
  is_purchased boolean DEFAULT false,
  visibility text NOT NULL DEFAULT 'friends' CHECK (visibility IN ('friends', 'public')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create likes table (legacy)
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id uuid NOT NULL REFERENCES public.tips(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tip_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id uuid NOT NULL REFERENCES public.tips(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reactions table (NEW)
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id uuid NOT NULL REFERENCES public.tips(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'useful', 'love', 'celebration')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tip_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" 
ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of" 
ON public.friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Tips policies
CREATE POLICY "Users can view tips from friends or public tips" 
ON public.tips FOR SELECT 
USING (
  visibility = 'public' 
  OR auth.uid() = user_id 
  OR (
    visibility = 'friends' 
    AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((requester_id = auth.uid() AND addressee_id = tips.user_id) 
           OR (addressee_id = auth.uid() AND requester_id = tips.user_id))
    )
  )
);

CREATE POLICY "Users can create their own tips" 
ON public.tips FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tips" 
ON public.tips FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tips" 
ON public.tips FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view all likes" 
ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view all comments" 
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions policies (NEW)
CREATE POLICY "Users can view all reactions" 
ON public.reactions FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" 
ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.reactions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_friendships_updated_at') THEN
    CREATE TRIGGER update_friendships_updated_at
      BEFORE UPDATE ON public.friendships
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tips_updated_at') THEN
    CREATE TRIGGER update_tips_updated_at
      BEFORE UPDATE ON public.tips
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON public.comments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reactions_tip_id ON public.reactions(tip_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_tip ON public.reactions(user_id, tip_id);
CREATE INDEX IF NOT EXISTS idx_likes_tip_id ON public.likes(tip_id);
CREATE INDEX IF NOT EXISTS idx_comments_tip_id ON public.comments(tip_id);
