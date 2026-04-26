-- Reconciliation with production billing blueprint: extend lawyer_leads; document Pro source of truth.
-- Pro status remains profiles.plan_tier + subscription_status (no duplicate is_pro column — single source of truth).

COMMENT ON COLUMN public.profiles.plan_tier IS 'Subscription tier: free | pro. Authoritative with subscription_status for Stripe state.';

ALTER TABLE public.lawyer_leads
  ADD COLUMN IF NOT EXISTS firm_size TEXT,
  ADD COLUMN IF NOT EXISTS use_case TEXT;
