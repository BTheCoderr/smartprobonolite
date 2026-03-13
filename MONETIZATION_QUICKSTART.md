# 💰 Monetization Quick Start Guide

## Priority #1: Get Paid Customers ASAP

This guide walks you through implementing the subscription system in **1-2 weeks**.

---

## 🎯 Step 1: Database Schema (Day 1)

Run this SQL in your Supabase SQL editor:

```sql
-- 1. Create subscription tiers
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'free', 'pro', 'enterprise'
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  case_limit INTEGER, -- null = unlimited
  document_limit INTEGER, -- null = unlimited
  storage_mb INTEGER, -- null = unlimited
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  metric_type TEXT NOT NULL, -- 'document_generated', 'intake_processed', 'storage_mb'
  metric_value INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create grant applications (for free tier)
CREATE TABLE grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL, -- 'legal_aid', 'law_clinic', 'pro_bono', 'bar_association'
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  justification TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  granted_tier_id UUID REFERENCES subscription_tiers(id),
  granted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insert default tiers
INSERT INTO subscription_tiers (name, display_name, price_monthly, price_yearly, features, case_limit, document_limit, storage_mb) VALUES
('free', 'Free (Legal Aid)', 0, 0, 
 '["AI intake assistant", "Basic document templates", "Email support", "Community access"]'::jsonb,
 10, -- 10 cases per month
 50, -- 50 documents per month
 100), -- 100 MB storage
('pro', 'Pro', 99, 990, 
 '["Unlimited AI intake", "Full document library", "Case tracking", "Analytics dashboard", "Priority support"]'::jsonb,
 NULL, -- unlimited
 NULL, -- unlimited
 1000), -- 1 GB storage
('enterprise', 'Enterprise', NULL, NULL, -- custom pricing
 '["White-label portal", "Bulk user management", "Advanced analytics", "API access", "Dedicated support", "Custom integrations"]'::jsonb,
 NULL,
 NULL,
 NULL);

-- 6. Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view tiers (public)
CREATE POLICY "Anyone can view tiers" ON subscription_tiers
  FOR SELECT USING (true);

-- Users can create their own usage logs
CREATE POLICY "Users can create own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can apply for grants
CREATE POLICY "Users can create grant applications" ON grant_applications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own grant applications
CREATE POLICY "Users can view own grant applications" ON grant_applications
  FOR SELECT USING (auth.uid() = user_id OR contact_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- 8. Create helper function to get current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  tier_name TEXT,
  tier_display_name TEXT,
  status TEXT,
  billing_cycle TEXT,
  features JSONB,
  case_limit INTEGER,
  document_limit INTEGER,
  storage_mb INTEGER,
  period_end TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    st.name,
    st.display_name,
    s.status,
    s.billing_cycle,
    st.features,
    st.case_limit,
    st.document_limit,
    st.storage_mb,
    s.current_period_end
  FROM subscriptions s
  JOIN subscription_tiers st ON s.tier_id = st.id
  WHERE s.user_id = user_uuid
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create helper function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  user_uuid UUID,
  metric_type TEXT,
  subscription_period_start TIMESTAMP
)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get current usage for this period
  SELECT COALESCE(SUM(metric_value), 0) INTO usage_count
  FROM usage_logs
  WHERE user_id = user_uuid
    AND metric_type = check_usage_limit.metric_type
    AND created_at >= subscription_period_start;

  -- Get tier limit
  SELECT 
    CASE 
      WHEN metric_type = 'document_generated' THEN st.document_limit
      WHEN metric_type = 'intake_processed' THEN st.case_limit
      ELSE NULL
    END INTO tier_limit
  FROM subscriptions s
  JOIN subscription_tiers st ON s.tier_id = st.id
  WHERE s.user_id = user_uuid
    AND s.status = 'active'
    AND s.current_period_start = subscription_period_start
  LIMIT 1;

  -- Return remaining (null limit = unlimited)
  IF tier_limit IS NULL THEN
    RETURN -1; -- -1 means unlimited
  ELSE
    RETURN GREATEST(0, tier_limit - usage_count);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎯 Step 2: Stripe Setup (Day 2)

### A. Create Stripe Account
1. Go to https://stripe.com
2. Sign up for account
3. Get API keys from Dashboard → Developers → API keys

### B. Install Stripe SDK
```bash
npm install stripe @stripe/stripe-js
```

### C. Add Environment Variables
```env
# Add to .env.local
STRIPE_SECRET_KEY=sk_test_... # Use test key first
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Get after setting up webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Same as above, for client
```

### D. Create Stripe Products & Prices
Go to Stripe Dashboard → Products → Create:
1. **Free Tier** - $0/month
2. **Pro Monthly** - $99/month
3. **Pro Yearly** - $990/year (save 17%)

Copy the Price IDs (e.g., `price_1234...`) — you'll need them.

---

## 🎯 Step 3: API Routes (Days 3-5)

### A. Create Subscription Check Middleware

Create `lib/middleware/subscriptionCheck.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  limits: {
    documents: number | null; // null = unlimited
    cases: number | null;
    storage: number | null;
  };
  usage: {
    documents: number;
    cases: number;
  };
}

export async function getUserSubscription(user: User): Promise<SubscriptionStatus | null> {
  const { data, error } = await supabase
    .rpc('get_user_subscription', { user_uuid: user.id });

  if (error || !data || data.length === 0) {
    // Default to free tier if no subscription
    return {
      tier: 'free',
      status: 'active',
      limits: { documents: 50, cases: 10, storage: 100 },
      usage: { documents: 0, cases: 0 }
    };
  }

  const sub = data[0];
  
  // Get usage counts
  const { data: usage } = await supabase
    .from('usage_logs')
    .select('metric_type, metric_value')
    .eq('user_id', user.id)
    .gte('created_at', sub.period_end);

  const documents = usage?.filter(u => u.metric_type === 'document_generated')
    .reduce((sum, u) => sum + u.metric_value, 0) || 0;
  const cases = usage?.filter(u => u.metric_type === 'intake_processed')
    .reduce((sum, u) => sum + u.metric_value, 0) || 0;

  return {
    tier: sub.tier_name,
    status: sub.status,
    limits: {
      documents: sub.document_limit,
      cases: sub.case_limit,
      storage: sub.storage_mb
    },
    usage: { documents, cases }
  };
}

export async function checkLimit(
  user: User,
  metricType: 'document_generated' | 'intake_processed',
  subscription: SubscriptionStatus
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = metricType === 'document_generated' 
    ? subscription.limits.documents 
    : subscription.limits.cases;
  
  const usage = metricType === 'document_generated'
    ? subscription.usage.documents
    : subscription.usage.cases;

  if (limit === null) {
    return { allowed: true, remaining: -1 }; // unlimited
  }

  const remaining = limit - usage;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining)
  };
}
```

### B. Create Checkout API Route

Create `pages/api/subscriptions/checkout.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tier, billingCycle } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get tier from database
  const { data: tierData, error: tierError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('name', tier)
    .single();

  if (tierError || !tierData) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  // Get Stripe price ID (you'll need to map these)
  const priceMap: Record<string, Record<string, string>> = {
    pro: {
      monthly: 'price_...', // Your Stripe price ID
      yearly: 'price_...',
    },
    // Add enterprise if needed
  };

  const priceId = priceMap[tier]?.[billingCycle];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid billing cycle' });
  }

  // Create or get Stripe customer
  let customerId: string;
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (existingSub?.stripe_customer_id) {
    customerId = existingSub.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.origin}/dashboard?success=true`,
    cancel_url: `${req.headers.origin}/pricing?canceled=true`,
    metadata: {
      userId: user.id,
      tier: tier,
    },
  });

  return res.json({ sessionId: session.id, url: session.url });
}
```

### C. Create Webhook Handler

Create `pages/api/webhooks/stripe.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSubscriptionCreated(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;
    }
  }

  res.json({ received: true });
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  
  if (!userId || !tier) return;

  // Get tier ID
  const { data: tierData } = await supabase
    .from('subscription_tiers')
    .select('id')
    .eq('name', tier)
    .single();

  if (!tierData) return;

  // Create subscription record
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  await supabase.from('subscriptions').insert({
    user_id: userId,
    tier_id: tierData.id,
    status: 'active',
    billing_cycle: subscription.items.data[0].price.recurring?.interval === 'month' ? 'monthly' : 'yearly',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      status: subscription.status === 'active' ? 'active' : 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}
```

**Important:** Configure webhook in Stripe Dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 🎯 Step 4: Frontend Components (Days 6-7)

### A. Pricing Page

Create `app/pricing/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useProfile } from '@/lib/hooks/useProfile';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const { user } = useProfile();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (tier: 'pro' | 'enterprise') => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          tier,
          billingCycle,
        }),
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
      <p className="text-center text-gray-600 mb-8">
        Mission-driven pricing that scales with your impact
      </p>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded ${billingCycle === 'monthly' ? 'bg-white shadow' : ''}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded ${billingCycle === 'yearly' ? 'bg-white shadow' : ''}`}
          >
            Yearly (Save 17%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className="border rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-2">Free</h3>
          <p className="text-gray-600 mb-4">For Legal Aid Organizations</p>
          <div className="text-4xl font-bold mb-6">$0</div>
          <ul className="space-y-2 mb-6">
            <li>✓ 10 cases/month</li>
            <li>✓ 50 documents/month</li>
            <li>✓ Basic templates</li>
            <li>✓ Email support</li>
          </ul>
          <button className="w-full py-2 border rounded hover:bg-gray-50">
            Apply for Free Access
          </button>
        </div>

        {/* Pro Tier */}
        <div className="border-2 border-blue-500 rounded-lg p-6 relative">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl">
            Popular
          </div>
          <h3 className="text-2xl font-bold mb-2">Pro</h3>
          <p className="text-gray-600 mb-4">For Small Law Firms</p>
          <div className="text-4xl font-bold mb-6">
            ${billingCycle === 'monthly' ? '99' : '990'}
            <span className="text-lg text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li>✓ Unlimited cases</li>
            <li>✓ Unlimited documents</li>
            <li>✓ Full template library</li>
            <li>✓ Analytics dashboard</li>
            <li>✓ Priority support</li>
          </ul>
          <button
            onClick={() => handleSubscribe('pro')}
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? 'Loading...' : 'Subscribe'}
          </button>
        </div>

        {/* Enterprise */}
        <div className="border rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
          <p className="text-gray-600 mb-4">For Courts & Bar Associations</p>
          <div className="text-4xl font-bold mb-6">Custom</div>
          <ul className="space-y-2 mb-6">
            <li>✓ White-label portal</li>
            <li>✓ Bulk user management</li>
            <li>✓ Advanced analytics</li>
            <li>✓ API access</li>
            <li>✓ Dedicated support</li>
          </ul>
          <button className="w-full py-2 border rounded hover:bg-gray-50">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
```

### B. Update API Routes to Check Limits

Update `pages/api/generate-doc.ts`:

```typescript
// Add at the top
import { getUserSubscription, checkLimit } from '@/lib/middleware/subscriptionCheck';

// In the handler, before generating:
const subscription = await getUserSubscription(user);
const limitCheck = await checkLimit(user, 'document_generated', subscription);

if (!limitCheck.allowed) {
  return res.status(403).json({
    error: 'Document limit reached',
    message: `You've reached your ${subscription.tier} tier limit. Upgrade to Pro for unlimited documents.`,
    upgradeUrl: '/pricing'
  });
}

// After generating, log usage:
await supabase.from('usage_logs').insert({
  user_id: user.id,
  subscription_id: subscription.id,
  metric_type: 'document_generated',
  metric_value: 1,
});
```

---

## 🎯 Step 5: Test & Launch (Day 8)

1. **Test in Stripe Test Mode:**
   - Use test card: `4242 4242 4242 4242`
   - Create test subscription
   - Verify webhook fires
   - Check database records

2. **Switch to Live Mode:**
   - Update environment variables
   - Configure live webhook endpoint
   - Test with real card (small amount)

3. **Launch:**
   - Add pricing link to navigation
   - Email existing users about upgrade
   - Monitor Stripe dashboard

---

## ✅ You're Done!

**What you've built:**
- ✅ Subscription tiers (Free/Pro/Enterprise)
- ✅ Stripe payment processing
- ✅ Usage tracking & limits
- ✅ Webhook handling
- ✅ Pricing page

**Next steps:**
- Add upgrade prompts in UI when limits reached
- Create admin dashboard to manage subscriptions
- Set up email receipts (Stripe handles this automatically)
- Add analytics to track conversion rates

**Time to revenue: ~1-2 weeks** 🚀

