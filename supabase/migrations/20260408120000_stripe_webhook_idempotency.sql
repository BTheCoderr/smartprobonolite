-- Idempotent Stripe webhook processing: skip duplicate event IDs after successful handling.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only stripe_webhook_events" ON public.stripe_webhook_events
  FOR ALL USING (false);
