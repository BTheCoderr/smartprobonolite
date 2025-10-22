# 🔐 Environment Variables Setup Guide

**Complete step-by-step guide to configure SmartProBono Lite**

---

## 📋 Quick Overview

You need to set up:
1. **.env.local file** (stores your API keys)
2. **Supabase** (database + authentication)
3. **AI Provider** (Hugging Face, Groq, or Demo mode)

**Time required:** 5-10 minutes

---

## Step 1: Create .env.local File

### 1.1 Create the file

In your terminal, run:

```bash
touch .env.local
```

### 1.2 Open the file in your editor

```bash
open .env.local
# or
nano .env.local
# or use Cursor/VS Code to open it
```

### 1.3 Start with Demo Mode (works immediately!)

Copy and paste this into your `.env.local`:

```env
# Demo Mode - Works without any API keys!
AI_PROVIDER=fallback
NODE_ENV=development
```

**Save the file** and restart your server:

```bash
npm run dev
```

✅ **Your app now works!** Visit http://localhost:3000/dashboard

---

## Step 2: Set Up Supabase (5 minutes)

### 2.1 Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** (easiest) or email
4. Verify your email if needed

### 2.2 Create New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   ```
   Name: smartprobono-lite
   Database Password: [Create a strong password - SAVE THIS!]
   Region: [Choose closest to you]
   ```
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete ☕

### 2.3 Get Your API Keys

1. In Supabase, click **⚙️ Settings** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. You'll see these important values:

**Copy these 3 values:**

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: your_supabase_key_here
service_role key: your_supabase_key_here
```

⚠️ **Important:** The `service_role` key is SECRET - never share it!

### 2.4 Add Keys to .env.local

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Demo Mode (we'll upgrade this later)
AI_PROVIDER=fallback
NODE_ENV=development
```

### 2.5 Run Database Schema

1. In Supabase, click **📊 SQL Editor** in sidebar
2. Click **"+ New query"**
3. Open this file: `supabase/production-schema.sql`
4. **Copy ALL the SQL** from that file
5. **Paste** into Supabase SQL Editor
6. Click **"Run"** button (or press Cmd/Ctrl + Enter)
7. You should see: ✅ **"Success. No rows returned"**

### 2.6 Verify Tables Created

1. Click **🗄️ Table Editor** in Supabase sidebar
2. You should see these tables:
   - ✅ `chats`
   - ✅ `documents`
   - ✅ `uploads`

**🎉 Supabase is ready!**

---

## Step 3: Choose Your AI Provider

### Option A: Stay in Demo Mode (FREE - No Setup)

**Already done!** Your `.env.local` has:
```env
AI_PROVIDER=fallback
```

✅ **Pros:** Works immediately, no API keys needed
⚠️ **Cons:** Responses are simulated, not true AI

---

### Option B: Hugging Face (FREE - 30k requests/month)

**Best for production use - completely free tier!**

#### 3.1 Create Hugging Face Account

1. Go to **https://huggingface.co/join**
2. Sign up with email or Google
3. Verify your email

#### 3.2 Create API Token

1. Go to **https://huggingface.co/settings/tokens**
2. Click **"New token"**
3. Settings:
   ```
   Name: SmartProBono
   Type: Read
   ```
4. Click **"Generate a token"**
5. **Copy the token** (starts with `hf_...`)

#### 3.3 Add to .env.local

Update your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Hugging Face AI Provider
HUGGINGFACE_API_KEY=hf_your_actual_token_here
AI_PROVIDER=huggingface

NODE_ENV=development
```

---

### Option C: Groq (FREE - 14k requests/day)

**Best for fast responses - completely free!**

#### 3.1 Create Groq Account

1. Go to **https://console.groq.com**
2. Click **"Sign In"**
3. Sign in with **Google** or **GitHub**

#### 3.2 Create API Key

1. Click **"API Keys"** in left sidebar
2. Click **"Create API Key"**
3. Give it a name: `SmartProBono`
4. Click **"Submit"**
5. **Copy the key** (starts with `your_groq_api_key_here...`)
6. ⚠️ **Save it now** - you won't see it again!

#### 3.3 Add to .env.local

Update your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Groq AI Provider
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq

NODE_ENV=development
```

---

## Step 4: Restart Your App

After updating `.env.local`, restart the server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verify Everything Works

### Test 1: Landing Page
- Visit: http://localhost:3000
- Should see beautiful landing page
- Click "Sign In" → should go to login page

### Test 2: Login (if Supabase is set up)
- Visit: http://localhost:3000/login
- Enter your email
- Click "Send Magic Link"
- Check your email for the login link
- Click the link → should redirect to dashboard

### Test 3: Dashboard
- Visit: http://localhost:3000/dashboard
- Should see Ermi's chat interface
- Try chatting with Ermi
- Upload a file (if you have one)
- Generate a document

### Test 4: AI Responses
- **Demo Mode:** Gets simulated responses
- **Hugging Face/Groq:** Gets real AI responses

---

## 🎯 Complete .env.local Example

Here's what your final `.env.local` should look like:

```env
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here

# ===== AI PROVIDER =====
# Choose ONE of these:

# Option 1: Hugging Face (recommended for production)
HUGGINGFACE_API_KEY=hf_AbCdEfGhIjKlMnOpQrStUvWxYz123456
AI_PROVIDER=huggingface

# Option 2: Groq (faster responses)
# GROQ_API_KEY=your_groq_api_key_here
# AI_PROVIDER=groq

# Option 3: Demo Mode (no AI key needed)
# AI_PROVIDER=fallback

# ===== DEVELOPMENT =====
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Problem: "Supabase is not configured"
- ✅ Make sure `.env.local` exists
- ✅ Check that URLs don't have trailing slashes
- ✅ Restart the dev server after changes

### Problem: "AI not responding"
- ✅ Check your AI_PROVIDER value
- ✅ Verify API key is correct
- ✅ For demo mode, make sure it's set to `fallback`

### Problem: "Can't log in"
- ✅ Verify Supabase keys are correct
- ✅ Check that database schema was run
- ✅ Look in your email (check spam folder)

### Problem: "Environment file not found"
- ✅ File must be named `.env.local` (with the dot)
- ✅ Must be in the project root directory
- ✅ Restart dev server after creating it

---

## 📞 Need Help?

1. Check the terminal for error messages
2. Check browser console (F12) for errors
3. Review the other documentation files:
   - `SUPABASE_SETUP_GUIDE.md`
   - `FREE_AI_SETUP.md`
   - `QUICK_REFERENCE.md`

---

## 🎉 You're Done!

Once your `.env.local` is set up with at least:
- ✅ AI_PROVIDER (even if just 'fallback')
- ✅ Supabase keys (optional but recommended)

**SmartProBono Lite is ready to use!** 🚀

Visit http://localhost:3000 and start automating legal intake!

