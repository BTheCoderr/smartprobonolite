# 🔑 Getting Your Supabase API Keys

## ⚠️ Important: You Need API Keys, Not Database Connection Strings

The connection strings you have are for **direct database access**.  
For SmartProBono Lite, we need the **API keys** instead.

---

## 📋 Step-by-Step: Get Your API Keys

### Step 1: Go to Supabase Dashboard
Open: **https://supabase.com/dashboard**

### Step 2: Select Your Project
Click on your `smartprobono-lite` project

### Step 3: Go to Project Settings
1. Look at the **left sidebar**
2. Click the **⚙️ Settings** icon (gear icon at bottom)
3. Or click **"Project Settings"** if you see it

### Step 4: Click "API" Section
1. In the Settings menu, click **"API"** in the left sidebar
2. You'll see a page titled "API Settings"

### Step 5: Copy These 3 Values

You'll see these sections on the page:

#### 1️⃣ Project URL
```
URL: https://hohzypfmoxjogysggwug.supabase.co
```
📋 **Copy this entire URL**

#### 2️⃣ Project API keys

You'll see two keys listed:

**anon public** (safe to use in a browser)
```
your_supabase_key_here
```
📋 **Copy the full key** (it's very long - usually 200+ characters)

**service_role** (secret - keep this safe!)
```
your_supabase_key_here
```
📋 **Copy this full key too**

---

## ✍️ Add Keys to .env.local

Once you have all 3 values, I'll update your `.env.local` file.

**Tell me when you have:**
1. ✅ Project URL (https://hohzypfmoxjogysggwug.supabase.co)
2. ❓ anon public key
3. ❓ service_role key

---

## 🎯 What Each Key Does

| Key | Purpose | Where It's Used |
|-----|---------|-----------------|
| **Project URL** | Base URL for API calls | Frontend + Backend |
| **anon public** | Public access (browser safe) | Frontend login/auth |
| **service_role** | Admin access (secret) | Backend API routes |

---

## 📸 Visual Guide

When you're in the API settings page, you'll see:

```
Configuration
│
├── Project URL
│   └── https://hohzypfmoxjogysggwug.supabase.co
│
└── Project API keys
    │
    ├── anon public
    │   └── your_supabase_key_here [long string]
    │
    └── service_role
        └── your_supabase_key_here [long string]
```

---

## 🚀 Once You Give Me the Keys

I'll update your `.env.local` to look like this:

```env
# ===== SUPABASE CONFIGURATION =====
NEXT_PUBLIC_SUPABASE_URL=https://hohzypfmoxjogysggwug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here

# ===== AI PROVIDER =====
AI_PROVIDER=fallback

# ===== DEVELOPMENT =====
NODE_ENV=development
```

Then we'll:
1. ✅ Run the database schema
2. ✅ Restart the server
3. ✅ Test the login!

---

## 📞 Need Help Finding It?

### Quick Path:
```
Supabase Dashboard 
  → Your Project 
    → Settings (⚙️) 
      → API 
        → Copy the 3 values
```

### Still Can't Find It?
- Make sure you're logged into https://supabase.com/dashboard
- Make sure you've selected your `smartprobono-lite` project
- The API keys page should show your Project URL at the top

---

**Ready? Paste your 3 values here and I'll configure everything!** 🎯

