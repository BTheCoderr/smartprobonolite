-- Monetization: subscription fields, analytics events, lawyer leads
-- Run in Supabase SQL editor or via CLI after review.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles (stripe_customer_id);

CREATE TABLE IF NOT EXISTS public.app_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS app_events_user_id_idx ON public.app_events (user_id);
CREATE INDEX IF NOT EXISTS app_events_event_name_idx ON public.app_events (event_name);
CREATE INDEX IF NOT EXISTS app_events_created_at_idx ON public.app_events (created_at DESC);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- No client access; server uses service role only.
CREATE POLICY "Service role only for app_events" ON public.app_events
  FOR ALL USING (false);

CREATE TABLE IF NOT EXISTS public.lawyer_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  firm_name TEXT,
  message TEXT,
  source TEXT DEFAULT 'for-lawyers'
);

CREATE INDEX IF NOT EXISTS lawyer_leads_email_idx ON public.lawyer_leads (email);
CREATE INDEX IF NOT EXISTS lawyer_leads_created_at_idx ON public.lawyer_leads (created_at DESC);

ALTER TABLE public.lawyer_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for lawyer_leads" ON public.lawyer_leads
  FOR ALL USING (false);
