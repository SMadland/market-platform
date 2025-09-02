/*
  # Clean up test data and reset database

  1. Data Cleanup
    - Remove all test users and their data
    - Reset all tables to clean state
    - Preserve table structure and policies

  2. Tables Affected
    - profiles (user profiles)
    - tips (user tips and recommendations)
    - friendships (friend connections)
    - likes (tip likes)
    - comments (tip comments)
    - conversations (direct messages)
    - conversation_messages (chat messages)
    - groups (chat groups)
    - group_members (group memberships)
    - group_messages (group chat messages)
    - business_subscribers (business accounts)

  3. Security
    - All RLS policies remain intact
    - No structural changes to database
*/

-- Clean up all user-generated data
DELETE FROM public.conversation_messages;
DELETE FROM public.conversations;
DELETE FROM public.group_messages;
DELETE FROM public.group_members;
DELETE FROM public.groups;
DELETE FROM public.comments;
DELETE FROM public.likes;
DELETE FROM public.tips;
DELETE FROM public.friendships;
DELETE FROM public.business_subscribers;
DELETE FROM public.profiles;

-- Reset sequences if any exist
-- Note: We use UUIDs so no sequences to reset

-- Clean up storage buckets (avatars)
-- Note: This would need to be done via Supabase dashboard or storage API
-- as we cannot directly delete storage objects via SQL

-- Verify cleanup
DO $$
DECLARE
    table_name text;
    row_count integer;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['profiles', 'tips', 'friendships', 'likes', 'comments', 
                           'conversations', 'conversation_messages', 'groups', 
                           'group_members', 'group_messages', 'business_subscribers'])
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO row_count;
        RAISE NOTICE 'Table % has % rows after cleanup', table_name, row_count;
    END LOOP;
END $$;