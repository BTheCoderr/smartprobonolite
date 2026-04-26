# 🔑 Update Your .env.local File

## ✅ **Add Your API Keys**

Open your `.env.local` file and add your API keys:

```env
# SmartProBono Lite - Environment Configuration

# ===== SUPABASE CONFIGURATION =====
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===== AI PROVIDER CONFIGURATION =====
# Using Groq for fast, high-quality AI responses (FREE tier!)
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq

# ===== EMAIL SERVICE =====
# Resend for email notifications
RESEND_API_KEY=your_resend_api_key_here

# Stripe webhook and production billing

See [docs/STRIPE_PRODUCTION.md](docs/STRIPE_PRODUCTION.md) for webhook URL, events list, and operational notes.

# ===== STRIPE (monetization) =====
STRIPE_SECRET_KEY=sk_live_or_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Create a recurring Price in Stripe Dashboard → copy price_...
STRIPE_PRICE_ID_PRO=price_...
# Used for checkout success/cancel URLs (set in production, e.g. https://yourapp.netlify.app)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===== DEVELOPMENT =====
NODE_ENV=development
```

## 🚀 **After Updating:**

1. **Save the file**
2. **Restart your server:**
   ```bash
   npm run dev
   ```
3. **Test the early access form!**

---

## 🎯 **What's Fixed:**

✅ **"Try Demo" button** → Goes directly to dashboard  
✅ **"Request Early Access" button** → Scrolls to form (no mail app)  
✅ **Early access form** → Sends emails via Resend  
✅ **Professional email templates** → Branded and informative  

---

**Update your .env.local and restart the server to test the email functionality!** 🚀
