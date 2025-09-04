-- Make username nullable to allow users to save without username
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;