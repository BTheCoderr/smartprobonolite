# Stripe and billing (production)

## Single source of truth for Pro status

- **`profiles.plan_tier`** (`free` | `pro`) and **`subscription_status`** are updated by the **Stripe webhook** only (`pages/api/stripe/webhook.ts`), not by the success page.
- The success page (`app/upgrade/success/page.tsx`) **polls** `refreshProfile()` so the UI updates after the webhook runs.
- Do **not** add a client-only “confirm payment” route that sets Pro without verifying Stripe.

## Webhook setup

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks** → **Add endpoint**.
2. URL: `https://<your-domain>/api/stripe/webhook`
3. Events (minimum):
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** into `.env`:

   `STRIPE_WEBHOOK_SECRET=whsec_...`

5. Redeploy so the server sees the new secret.

Local testing: use Stripe CLI:

`stripe listen --forward-to localhost:3000/api/stripe/webhook`

## API surface (Pages Router)

Billing and analytics use **`pages/api`** only (no duplicate `app/api` routes):

| Route | Purpose |
|-------|---------|
| `POST /api/stripe/create-checkout-session` | Authenticated Checkout Session (subscription mode) |
| `POST /api/stripe/webhook` | Raw body; verifies signature; updates `profiles` |
| `POST /api/events` | Inserts into `app_events` (service role) |
| `POST /api/leads/for-lawyers` | Inserts into `lawyer_leads` |

## Environment

See [UPDATE_ENV.md](../UPDATE_ENV.md) for `STRIPE_*`, `NEXT_PUBLIC_APP_URL`, and Supabase service role.

## Events table name

Product analytics are stored in **`app_events`** (not `events`) to match the applied migration. The client may send `event_name` or `event_type`; the API normalizes to `event_name`.
