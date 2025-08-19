-- Add tip_type column to distinguish between private and business tips
ALTER TABLE public.tips 
ADD COLUMN tip_type text NOT NULL DEFAULT 'private' CHECK (tip_type IN ('private', 'business'));