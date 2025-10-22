# SmartProBono Lite - Quick Setup Guide

## Step-by-Step Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create a New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name: `smartprobono-lite`
   - Choose a database password (save this!)
   - Select region closest to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get Your API Keys**
   - Go to Project Settings (gear icon in sidebar)
   - Click "API" in the left menu
   - Copy:
     - `Project URL` (looks like: https://xxxxx.supabase.co)
     - `anon/public` key (the long string under "Project API keys")

4. **Set Up Database Schema**
   - Go to "SQL Editor" in the left sidebar
   - Click "New query"
   - Copy the entire contents of `supabase/schema.sql` from this project
   - Paste into the SQL editor
   - Click "Run" button
   - You should see: "Success. No rows returned"

### Step 3: Get Groq API Key

1. **Sign Up for Groq**
   - Go to [console.groq.com](https://console.groq.com)
   - Sign in with Google or create account
   - It's FREE for developers!

2. **Create API Key**
   - Click "API Keys" in the left menu
   - Click "Create API Key"
   - Give it a name: "SmartProBono"
   - Copy the key (starts with `your_groq_api_key_here...`)
   - ⚠️ Save it now! You won't see it again

### Step 4: Configure Environment Variables

1. **Create `.env.local` file**
   - In the project root, create a new file named `.env.local`
   - Or copy the example: `cp .env.example .env.local`

2. **Add your credentials**
   ```env
   # From Supabase (Step 2.3)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here

   # From Groq (Step 3.2)
   GROQ_API_KEY=your_groq_api_key_here

   # Provider (leave as is)
   AI_PROVIDER=groq
   ```

3. **Save the file**

### Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Test It Out!

1. **Create an Account**
   - Enter your email and password
   - Click "Sign Up"
   - Check your email for verification link
   - Click the link to verify
   - Sign in with your credentials

2. **Upload a Test File**
   - Create a simple text file with sample intake info:
     ```
     Client Name: John Doe
     Contact: john@email.com
     Case Type: Personal Injury
     Date of Incident: October 10, 2025
     Description: Car accident on Main Street
     ```
   - Save as `test-intake.txt`
   - Drag and drop it into the upload area

3. **Chat with AI**
   - Click "Extract Info" button
   - Or type: "Please extract the key details"
   - Watch the AI analyze and extract information!

4. **Generate a Document**
   - Type: "Generate a client engagement letter"
   - Wait for AI to create the draft
   - Click "DOCX" to download

## Verification Checklist

✅ Dependencies installed (`node_modules` folder exists)  
✅ Supabase project created and schema loaded  
✅ API keys added to `.env.local`  
✅ Development server starts without errors  
✅ Can create an account and sign in  
✅ Can upload a file successfully  
✅ AI responds to chat messages  
✅ Can download generated documents  

## Common Issues & Solutions

### ❌ "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `npm install`

### ❌ "Invalid API key" error
**Solution:** 
- Check that `.env.local` exists
- Verify GROQ_API_KEY is correct
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### ❌ "Failed to fetch" when signing in
**Solution:**
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Supabase project is not paused
- Ensure database schema was run successfully

### ❌ "Network error" in AI chat
**Solution:**
- Verify GROQ_API_KEY is valid
- Check you have internet connection
- Visit [console.groq.com](https://console.groq.com) to verify API key

### ❌ File upload doesn't work
**Solution:**
- Ensure file is under 10MB
- Use only TXT, PDF, or DOCX files
- Check browser console (F12) for error messages

## Need Help?

1. **Check the logs**: Look at terminal where `npm run dev` is running
2. **Browser console**: Open DevTools (F12) and check Console tab
3. **Verify environment**: Run `cat .env.local` to check variables are set
4. **Fresh start**: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

## Next Steps

Once everything is working:

1. **Customize prompts** in `lib/prompts/intakePrompt.ts`
2. **Adjust styling** in `tailwind.config.ts`
3. **Add your firm name** in the document generator
4. **Deploy to Vercel** for production use

---

**Estimated Setup Time: 5-10 minutes**

Enjoy your AI-powered legal assistant! 🚀⚖️

