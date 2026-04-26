-- Prevent client-side writes to billing columns on profiles.
-- Only the service role (used by the Stripe webhook) should set these.

-- Drop the overly-broad "Users can update own profile" policy if it exists
-- and replace it with one that excludes billing fields.
DO $$
BEGIN
  -- Drop old permissive update policy (name may vary; common default shown)
  BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END
$$;

-- Recreate a restricted UPDATE policy: users may only change non-billing columns.
CREATE POLICY "Users can update own non-billing profile fields"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Ensure billing columns are unchanged from the existing row
    AND plan_tier       IS NOT DISTINCT FROM (SELECT p.plan_tier FROM public.profiles p WHERE p.id = id)
    AND subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.id = id)
    AND stripe_customer_id  IS NOT DISTINCT FROM (SELECT p.stripe_customer_id  FROM public.profiles p WHERE p.id = id)
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.id = id)
  );

-- Keep the existing SELECT policy intact (users can read their own profile).
