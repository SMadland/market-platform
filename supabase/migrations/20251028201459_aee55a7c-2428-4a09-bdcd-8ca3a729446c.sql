-- Fix invalid friendships where user is friends with themselves
DELETE FROM friendships WHERE requester_id = addressee_id;

-- Make some tips public so users can see content in the Explore feed
UPDATE tips 
SET visibility = 'public' 
WHERE id IN (
  SELECT id 
  FROM tips 
  WHERE visibility = 'friends' 
  LIMIT 5
);

-- Add index for better performance on tips queries
CREATE INDEX IF NOT EXISTS idx_tips_visibility_type ON tips(visibility, tip_type);
CREATE INDEX IF NOT EXISTS idx_tips_user_created ON tips(user_id, created_at DESC);