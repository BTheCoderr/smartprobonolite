# 🗄️ Supabase Setup Guide for SmartProBono Lite

Complete guide to set up user authentication, chat history, and document storage.

---

## 🎯 What You'll Get

After setup:
- ✅ **User Authentication** - Email magic links
- ✅ **Chat History** - All conversations saved per user
- ✅ **Document Storage** - Generated drafts automatically saved
- ✅ **File Uploads** - Intake forms stored securely
- ✅ **Row Level Security** - Users only see their own data

---

## 📋 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up** with GitHub or email
4. **Create new project:**
   - Name: `smartprobono-lite`
   - Database password: Choose a strong password
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

---

## 🔑 Step 2: Get Your API Keys

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API"** in the left menu
3. **Copy these values:**
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon/public` key (long string under "Project API keys")
   - `service_role` key (long string under "Project API keys" - keep this secret!)

---

## 🗃️ Step 3: Set Up Database Schema

1. **Go to "SQL Editor"** in your Supabase sidebar
2. **Click "New query"**
3. **Copy the entire contents** of `supabase/production-schema.sql`
4. **Paste into the SQL editor**
5. **Click "Run"** button
6. **Verify success** - you should see "Success" message

### What this creates:
- `chats` table - stores conversation history
- `documents` table - stores generated drafts
- `uploads` table - stores uploaded files
- Row Level Security policies
- Storage bucket for files

---

## ⚙️ Step 4: Configure Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# AI Provider (choose one)
AI_PROVIDER=fallback
# HUGGINGFACE_API_KEY=your_hf_token
# GROQ_API_KEY=your_groq_key
```

**Important:** 
- `NEXT_PUBLIC_*` keys are safe to expose (used in browser)
- `SUPABASE_SERVICE_ROLE_KEY` is secret (only used server-side)

---

## 🔐 Step 5: Enable Authentication

1. **Go to "Authentication"** in Supabase sidebar
2. **Click "Settings"** tab
3. **Configure "Site URL":**
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
4. **Add "Redirect URLs":**
   - `http://localhost:3000/dashboard`
   - `https://yourdomain.com/dashboard`

---

## 🧪 Step 6: Test Authentication

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Go to:** http://localhost:3000/login

3. **Test sign up:**
   - Enter your email
   - Click "Create Account"
   - Check your email for verification link

4. **Test magic link:**
   - Enter your email
   - Click "Send Magic Link"
   - Check your email for login link

---

## 📊 Step 7: Verify Data Storage

After logging in and chatting with Ermi:

1. **Go to Supabase Dashboard**
2. **Check "Table Editor"**
3. **Verify you see data in:**
   - `chats` table (your conversations)
   - `documents` table (generated drafts)
   - `auth.users` table (your user account)

---

## 🚀 Step 8: Deploy to Production

### For Vercel Deployment:

1. **Push code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables in Vercel dashboard

3. **Update Supabase settings:**
   - Add your production domain to "Site URL"
   - Add production redirect URLs

---

## 🔧 Troubleshooting

### "Invalid API key" error
- ✅ Check your `.env.local` file exists
- ✅ Verify API keys are correct (no extra spaces)
- ✅ Restart development server

### "Email not verified" error
- ✅ Check spam folder
- ✅ Try a different email address
- ✅ Verify Supabase email settings

### "Database connection failed"
- ✅ Check Supabase project isn't paused
- ✅ Verify schema was run successfully
- ✅ Check RLS policies are enabled

### Magic links not working
- ✅ Check "Site URL" in Supabase settings
- ✅ Add redirect URLs to allowed list
- ✅ Try different email provider

---

## 📈 What's Stored

### Chat History
```sql
-- Each conversation
{
  "id": "uuid",
  "user_id": "user_uuid", 
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "created_at": "timestamp"
}
```

### Generated Documents
```sql
-- Each draft document
{
  "id": "uuid",
  "user_id": "user_uuid",
  "title": "Generated Document",
  "content": "DRAFT - FOR ATTORNEY REVIEW...",
  "document_type": "draft"
}
```

### File Uploads
```sql
-- Each uploaded file
{
  "id": "uuid", 
  "user_id": "user_uuid",
  "file_name": "intake_form.pdf",
  "extracted_text": "Client Name: John Doe...",
  "file_url": "storage_path"
}
```

---

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own data
- Automatic user_id filtering
- No cross-user data leakage

### Authentication
- Email magic links (no passwords)
- JWT tokens for API access
- Automatic session management

### Data Privacy
- All data encrypted at rest
- HTTPS for all connections
- GDPR compliant infrastructure

---

## 📊 Usage Limits

### Supabase Free Tier
- **Database:** 500MB storage
- **Auth:** 50,000 monthly active users
- **Storage:** 1GB file storage
- **Bandwidth:** 2GB transfer

### For Small Law Firms
- ✅ **500MB** = ~1 million chat messages
- ✅ **50,000 users** = More than enough
- ✅ **1GB storage** = Thousands of documents

---

## 🎉 Success Checklist

After setup, verify:

- [ ] Can create account at `/login`
- [ ] Can sign in with magic link
- [ ] Redirects to `/dashboard` after login
- [ ] Chat messages appear in Supabase
- [ ] Generated documents are saved
- [ ] File uploads work (if enabled)
- [ ] Can sign out and back in
- [ ] Data persists between sessions

---

## 🚀 Next Steps

Once Supabase is working:

1. **Add file upload functionality**
2. **Implement document templates**
3. **Add user profiles**
4. **Create admin dashboard**
5. **Add team collaboration**

---

**You now have a production-ready AI legal assistant with full data persistence!** 🎉

*All conversations and documents are automatically saved and secured per user.*
