# SmartProBono Business Features Roadmap

## Implementation Plan: MVP → Mission-Driven SaaS Platform

This document outlines what it takes to transform the current MVP into a sustainable, mission-driven SaaS platform with proper monetization, analytics, and growth infrastructure.

---

## 🎯 Overview: Current State → Target State

**Current MVP:**
- ✅ Working AI assistant (Ermi)
- ✅ Document generation (custody letters)
- ✅ Authentication & persistence
- ✅ Clean UI

**Target State:**
- 💰 Tiered pricing (Free/Pro/Enterprise)
- 📊 Analytics & usage tracking
- 🎓 Guided onboarding
- 📈 Marketing optimization
- 🆘 Support infrastructure
- 🔄 Retention workflows

---

## 1. 💰 Monetization Infrastructure

### **Time Estimate: 2-3 weeks**

### What Needs to Be Built:

#### **A. Subscription Management System**
- **Database Schema:**
  ```sql
  -- Subscription tiers
  CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY,
    name TEXT, -- 'free', 'pro', 'enterprise'
    price_monthly DECIMAL,
    price_yearly DECIMAL,
    features JSONB, -- array of feature names
    case_limit INTEGER, -- null = unlimited
    user_limit INTEGER,
    created_at TIMESTAMP
  );

  -- User subscriptions
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    tier_id UUID REFERENCES subscription_tiers(id),
    status TEXT, -- 'active', 'cancelled', 'expired', 'trial'
    billing_cycle TEXT, -- 'monthly', 'yearly'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    stripe_subscription_id TEXT, -- if using Stripe
    stripe_customer_id TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );

  -- Usage tracking (for limits)
  CREATE TABLE usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    subscription_id UUID REFERENCES subscriptions(id),
    metric_type TEXT, -- 'document_generated', 'intake_processed', 'storage_mb'
    metric_value INTEGER,
    created_at TIMESTAMP
  );
  ```

- **API Routes Needed:**
  - `POST /api/subscriptions/create` - Create subscription
  - `GET /api/subscriptions/current` - Get user's current subscription
  - `POST /api/subscriptions/upgrade` - Upgrade tier
  - `POST /api/subscriptions/cancel` - Cancel subscription
  - `GET /api/subscriptions/usage` - Check usage limits

- **Frontend Components:**
  - `app/pricing/page.tsx` - Pricing page
  - `app/dashboard/components/SubscriptionStatus.tsx` - Show current tier & limits
  - `app/dashboard/components/UpgradePrompt.tsx` - Upgrade CTA when limit reached

#### **B. Payment Processing (Stripe Integration)**
- **Time: 1 week**
- **Setup:**
  1. Create Stripe account
  2. Install `stripe` npm package
  3. Add Stripe webhook handler: `pages/api/webhooks/stripe.ts`
  4. Create Stripe products/prices for each tier
  5. Implement checkout flow: `pages/api/checkout/create-session.ts`

- **Required Environment Variables:**
  ```env
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

#### **C. Access Control Middleware**
- **Time: 2-3 days**
- **Implementation:**
  - `lib/middleware/subscriptionCheck.ts` - Check subscription status
  - `lib/utils/featureFlags.ts` - Feature gating based on tier
  - Update API routes to check limits before processing

#### **D. Free Tier Grant System**
- **Time: 1 week**
- **Database:**
  ```sql
  CREATE TABLE grant_applications (
    id UUID PRIMARY KEY,
    organization_name TEXT,
    organization_type TEXT, -- 'legal_aid', 'law_clinic', 'pro_bono'
    contact_email TEXT,
    contact_name TEXT,
    justification TEXT,
    status TEXT, -- 'pending', 'approved', 'rejected'
    granted_tier_id UUID REFERENCES subscription_tiers(id),
    granted_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP
  );
  ```

- **API Route:**
  - `POST /api/grants/apply` - Submit grant application
  - `GET /api/grants/status` - Check application status

### **Total Cost:**
- Stripe: 2.9% + $0.30 per transaction (standard)
- Development: 2-3 weeks @ $X/hour
- Ongoing: Stripe subscription management (included)

---

## 2. 🎯 Product-Market Fit Expansion

### **Time Estimate: 3-4 weeks**

### What Needs to Be Built:

#### **A. Document Template Library**
- **Time: 2 weeks**
- **Database Schema:**
  ```sql
  CREATE TABLE document_templates (
    id UUID PRIMARY KEY,
    name TEXT, -- 'Custody Modification Letter', 'Eviction Notice', etc.
    category TEXT, -- 'family_law', 'housing', 'immigration', 'employment'
    jurisdiction TEXT, -- 'RI', 'MA', 'federal', 'general'
    template_content TEXT, -- base template with placeholders
    required_fields JSONB, -- ['client_name', 'opposing_party', 'court']
    available_tiers TEXT[], -- ['free', 'pro', 'enterprise']
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```

- **Implementation:**
  - Create template library: `lib/templates/index.ts`
  - Update `intakePrompt.ts` to support multiple document types
  - Add template selector UI: `app/dashboard/components/TemplateSelector.tsx`
  - Update `generate-doc.ts` API to use templates

#### **B. Jurisdiction-Specific Logic**
- **Time: 1 week**
- **Database:**
  ```sql
  CREATE TABLE jurisdiction_rules (
    id UUID PRIMARY KEY,
    jurisdiction_code TEXT, -- 'RI-FAMILY', 'MA-HOUSING'
    document_type TEXT,
    rules JSONB, -- formatting rules, required sections, etc.
    updated_at TIMESTAMP
  );
  ```

#### **C. Multi-Document Workflows**
- **Time: 1 week**
- **Features:**
  - Generate related documents (e.g., motion + cover letter + client summary)
  - Batch generation for multiple clients
  - Document comparison (before/after edits)

### **Document Types to Add:**
1. **Family Law:** Custody modification, divorce petitions, support orders
2. **Housing:** Eviction notices, tenant applications, lease agreements
3. **Immigration:** Naturalization forms, adjustment of status letters
4. **Employment:** Wage claim letters, discrimination complaints
5. **Consumer:** Debt collection responses, small claims filings

---

## 3. 📊 Analytics & Usage Tracking

### **Time Estimate: 1-2 weeks**

### What Needs to Be Built:

#### **A. Event Tracking System**
- **Time: 3-4 days**
- **Database Schema:**
  ```sql
  CREATE TABLE analytics_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    event_type TEXT, -- 'document_generated', 'chat_started', 'upgrade_clicked'
    event_properties JSONB, -- flexible metadata
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP
  );

  CREATE INDEX idx_analytics_user_date ON analytics_events(user_id, created_at);
  CREATE INDEX idx_analytics_event_type ON analytics_events(event_type, created_at);
  ```

- **API Route:**
  - `POST /api/analytics/track` - Log event (client-side)
  - `GET /api/analytics/dashboard` - Aggregate stats (admin)

#### **B. Analytics Dashboard (Admin)**
- **Time: 1 week**
- **Components:**
  - `app/admin/analytics/page.tsx` - Admin analytics dashboard
  - Charts: Users, documents generated, usage by tier, conversion funnel
  - Export reports to CSV

#### **C. User-Facing Analytics (Pro/Enterprise)**
- **Time: 3-4 days**
- **Components:**
  - `app/dashboard/components/UsageStats.tsx` - Show user their own stats
  - Firm-level analytics for Enterprise tier

#### **D. Third-Party Integration (Optional)**
- **Time: 2-3 days**
- **Options:**
  - Google Analytics 4 (free)
  - Mixpanel (paid, advanced)
  - PostHog (open source, self-hosted)

### **Key Metrics to Track:**
- **Conversion:** Demo → Signup → Paid conversion rate
- **Engagement:** Documents generated per user, sessions per week
- **Retention:** Monthly active users, churn rate
- **Usage:** Cases processed, documents generated, storage used
- **Business:** MRR, ARR, LTV, CAC

---

## 4. 🎓 Onboarding & Value Demonstration

### **Time Estimate: 1-2 weeks**

### What Needs to Be Built:

#### **A. Interactive Tutorial**
- **Time: 1 week**
- **Tools:**
  - Use `react-joyride` or `@reactour/tour` library
  - Create tour steps: `lib/onboarding/tourSteps.ts`

- **Components:**
  - `app/dashboard/components/OnboardingTour.tsx` - Guided tour
  - Highlights: File upload, chat with Ermi, document generation, export

#### **B. Welcome Flow**
- **Time: 3-4 days**
- **Components:**
  - `app/dashboard/components/WelcomeModal.tsx` - First-time user welcome
  - `app/dashboard/components/GettingStarted.tsx` - Checklist of first actions

#### **C. Sample Data & Templates**
- **Time: 2-3 days**
- **Features:**
  - Pre-loaded sample intake form
  - "Try with sample data" button
  - Video walkthrough (optional, external)

#### **D. Progress Tracking**
- **Time: 2-3 days**
- **Database:**
  ```sql
  CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    completed_steps TEXT[], -- ['upload_file', 'generate_doc', 'export']
    skipped BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP
  );
  ```

---

## 5. 📈 Marketing Optimization

### **Time Estimate: 1-2 weeks**

### What Needs to Be Built:

#### **A. Conversion Tracking**
- **Time: 2-3 days**
- **Implementation:**
  - Track CTA clicks: "Try Demo", "Request Early Access"
  - Track form submissions vs. conversions
  - Add UTM parameter tracking

#### **B. A/B Testing Infrastructure**
- **Time: 1 week**
- **Tools:**
  - Use `@vercel/flags` or `optimizely-sdk`
  - Create feature flags: `lib/utils/featureFlags.ts`

- **Tests to Run:**
  - Hero headline variations
  - CTA button copy/colors
  - Pricing page layout
  - Free tier messaging

#### **C. Landing Page Optimization**
- **Time: 3-4 days**
- **Components:**
  - Add social proof: Testimonials, logos, case studies
  - Add FAQ section: `app/components/FAQ.tsx`
  - Add video demo (optional)
  - Add live chat widget (Intercom/Crisp)

#### **D. Email Capture & Nurture**
- **Time: 1 week**
- **Tools:**
  - Resend (already integrated) or HubSpot
  - Email templates: Welcome, onboarding tips, upgrade prompts

- **Workflows:**
  - Welcome email (day 0)
  - Product tips (day 3, 7, 14)
  - Upgrade prompt (day 30 if still on free)

---

## 6. 🆘 Support Infrastructure

### **Time Estimate: 1-2 weeks**

### What Needs to Be Built:

#### **A. Help Center / Knowledge Base**
- **Time: 1 week**
- **Options:**
  - **Simple:** Static pages (`app/help/page.tsx`, `/help/getting-started`, etc.)
  - **Advanced:** Use Notion API or Sanity CMS for content management

- **Pages Needed:**
  - Getting Started
  - Document Templates Guide
  - Troubleshooting Common Issues
  - FAQ
  - Pricing & Billing
  - Privacy & Security

#### **B. Support Ticket System**
- **Time: 1 week**
- **Database:**
  ```sql
  CREATE TABLE support_tickets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    subject TEXT,
    description TEXT,
    status TEXT, -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT, -- 'low', 'medium', 'high', 'urgent'
    assigned_to UUID REFERENCES profiles(id), -- admin user
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );

  CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id),
    sender_id UUID REFERENCES profiles(id),
    message TEXT,
    is_internal BOOLEAN DEFAULT FALSE, -- admin notes
    created_at TIMESTAMP
  );
  ```

- **Components:**
  - `app/support/page.tsx` - Support request form
  - `app/admin/support/page.tsx` - Admin ticket dashboard

#### **C. In-App Help**
- **Time: 2-3 days**
- **Components:**
  - `app/dashboard/components/HelpButton.tsx` - Floating help button
  - Contextual tooltips using `react-tooltip`
  - Searchable help widget

#### **D. Live Chat (Optional)**
- **Time: 3-4 days**
- **Tools:**
  - Crisp (free tier available)
  - Intercom (paid)
  - Custom implementation

---

## 7. 🔄 Retention & Email Workflows

### **Time Estimate: 1-2 weeks**

### What Needs to Be Built:

#### **A. Email Service Integration**
- **Time: 2-3 days**
- **Setup:**
  - Already using Resend (good!)
  - Set up email templates for all workflows
  - Configure sender domain (recommended)

#### **B. Automated Email Workflows**
- **Time: 1 week**
- **Database:**
  ```sql
  CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY,
    name TEXT, -- 'welcome', 'onboarding_day_3', 'upgrade_prompt'
    trigger_event TEXT, -- 'signup', 'day_3', 'document_limit_reached'
    email_template TEXT, -- template name/key
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
  );

  CREATE TABLE email_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    campaign_id UUID REFERENCES email_campaigns(id),
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced BOOLEAN DEFAULT FALSE
  );
  ```

- **API Route:**
  - `pages/api/emails/send-workflow.ts` - Trigger workflow emails
  - Cron job (Vercel Cron or external) to send scheduled emails

#### **C. Workflow Templates**
- **Time: 3-4 days**
- **Email Types:**
  1. **Welcome Series:**
     - Day 0: Welcome + getting started
     - Day 3: Tips for first document
     - Day 7: Advanced features guide

  2. **Engagement:**
     - Inactive user (7 days): "We miss you"
     - Usage milestone: "You've generated 10 documents!"
     - Feature announcement: "New template available"

  3. **Retention:**
     - Free tier limit reached: Upgrade prompt
     - Trial ending: Convert to paid
     - Churn risk: Win-back email

  4. **Business:**
     - Invoice reminders
     - Subscription renewal
     - Payment failed

#### **D. In-App Notifications**
- **Time: 2-3 days**
- **Components:**
  - `app/dashboard/components/NotificationCenter.tsx` - Notification bell
  - Toast notifications for achievements/milestones
  - Banner notifications for announcements

---

## 📅 Recommended Implementation Timeline

### **Phase 1: Foundation (Weeks 1-4)**
**Priority: CRITICAL**
1. ✅ Monetization (Subscription + Stripe) - Weeks 1-2
2. ✅ Analytics (Basic tracking) - Week 3
3. ✅ Onboarding (Welcome flow) - Week 4

**Result:** You can start charging customers and tracking usage.

### **Phase 2: Growth (Weeks 5-8)**
**Priority: HIGH**
4. ✅ Product Expansion (More document types) - Weeks 5-6
5. ✅ Support Infrastructure (Help center) - Week 7
6. ✅ Retention (Email workflows) - Week 8

**Result:** Product is more valuable, users stay longer.

### **Phase 3: Optimization (Weeks 9-12)**
**Priority: MEDIUM**
7. ✅ Marketing Optimization (A/B testing) - Weeks 9-10
8. ✅ Advanced Analytics (Admin dashboard) - Weeks 11-12

**Result:** Better conversion, data-driven decisions.

---

## 💰 Total Investment Estimate

| Feature | Time | Complexity | Priority |
|---------|------|------------|----------|
| Monetization | 2-3 weeks | High | ⭐⭐⭐ CRITICAL |
| Product Expansion | 3-4 weeks | Medium | ⭐⭐⭐ HIGH |
| Analytics | 1-2 weeks | Medium | ⭐⭐ MEDIUM |
| Onboarding | 1-2 weeks | Low | ⭐⭐ MEDIUM |
| Marketing | 1-2 weeks | Low | ⭐ LOW |
| Support | 1-2 weeks | Medium | ⭐⭐ MEDIUM |
| Retention | 1-2 weeks | Medium | ⭐⭐ MEDIUM |

**Total Time: 10-17 weeks** (2.5-4 months full-time)

**Can be done in parallel with proper planning: ~8-10 weeks**

---

## 🚀 Quick Wins (Do First)

1. **Stripe Integration** (1 week) - Start generating revenue immediately
2. **Basic Analytics** (3 days) - Track key metrics
3. **Help Center** (Static pages, 2 days) - Reduce support burden
4. **Email Workflows** (1 week) - Improve retention

**These 4 items = ~2.5 weeks of work = Massive ROI**

---

## 🛠️ Tech Stack Recommendations

### **Monetization:**
- Stripe (industry standard, excellent docs)
- Alternative: Paddle (handles taxes)

### **Analytics:**
- Start simple: Custom events in your database
- Add later: PostHog (open source) or Mixpanel

### **Email:**
- Keep Resend (already integrated)
- Alternative: SendGrid, Mailgun

### **Support:**
- Simple: Static help pages + email
- Advanced: Zendesk, Intercom

### **Onboarding:**
- `react-joyride` or `@reactour/tour` (free, easy)

---

## 📋 Next Steps

1. **Decide:** Which features are most critical for your business goals?
2. **Prioritize:** Start with monetization + analytics (enables everything else)
3. **Build:** Follow the implementation details above
4. **Test:** Get feedback from pilot users before launching paid tiers
5. **Iterate:** Use analytics to guide feature development

---

## ❓ Questions to Answer Before Starting

1. **Timeline:** When do you need to start charging customers?
2. **Resources:** Do you have development capacity or need to hire?
3. **Validation:** Do you have paying customers ready to sign up?
4. **Grants:** Do you have grant funding secured for free tier?
5. **Legal:** Do you have terms of service, privacy policy, SLA?

---

**Ready to start?** Let's begin with monetization infrastructure — it's the foundation that enables everything else.

