-- Create business_subscribers table to track business subscriptions
CREATE TABLE public.business_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscription_type TEXT NOT NULL DEFAULT 'pilot', -- 'pilot', 'basic', 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'pending'
  api_access BOOLEAN NOT NULL DEFAULT false,
  api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_business_subscription" ON public.business_subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info (uses service role)
CREATE POLICY "update_business_subscription" ON public.business_subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info (uses service role)
CREATE POLICY "insert_business_subscription" ON public.business_subscribers
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_subscribers_updated_at
BEFORE UPDATE ON public.business_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();