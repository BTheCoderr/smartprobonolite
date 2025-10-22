# 🎯 SmartProBono Lite - Setup Checklist

Use this checklist to track your setup progress.

---

## ✅ Setup Progress

### Phase 1: Basic Setup (Required)
- [ ] Install dependencies (`npm install`)
- [ ] Create `.env.local` file
- [ ] Add `AI_PROVIDER=fallback` to `.env.local`
- [ ] Start dev server (`npm run dev`)
- [ ] Test app at http://localhost:3000

### Phase 2: Supabase Setup (Recommended)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project
- [ ] Copy Project URL
- [ ] Copy Anon/Public Key
- [ ] Copy Service Role Key
- [ ] Add all 3 keys to `.env.local`
- [ ] Open Supabase SQL Editor
- [ ] Run `supabase/production-schema.sql`
- [ ] Verify tables created (chats, documents, uploads)
- [ ] Restart dev server

### Phase 3: AI Provider (Optional - for real AI)
- [ ] **Option A: Hugging Face**
  - [ ] Create account at https://huggingface.co
  - [ ] Generate API token
  - [ ] Add to `.env.local`
  - [ ] Set `AI_PROVIDER=huggingface`

- [ ] **Option B: Groq**
  - [ ] Create account at https://console.groq.com
  - [ ] Generate API key
  - [ ] Add to `.env.local`
  - [ ] Set `AI_PROVIDER=groq`

- [ ] **Option C: Stay in Demo Mode**
  - [ ] Keep `AI_PROVIDER=fallback`
  - [ ] No API key needed!

### Phase 4: Testing (Verify Everything Works)
- [ ] Landing page loads (http://localhost:3000)
- [ ] Login page accessible (/login)
- [ ] Dashboard accessible (/dashboard)
- [ ] Can chat with Ermi
- [ ] Can upload files
- [ ] Can generate documents
- [ ] Can export documents
- [ ] (If Supabase) Can log in via magic link
- [ ] (If Supabase) Chat history saves
- [ ] (If AI) Getting real AI responses

---

## 🚀 Quick Start Options

### Fastest: Demo Mode (0 minutes)
```bash
# Create .env.local with just this:
echo "AI_PROVIDER=fallback" > .env.local
npm run dev
```
✅ Works immediately, no API keys needed!

### Recommended: Full Setup (5 minutes)
```bash
# Run the interactive setup wizard:
./setup-wizard.sh
```
Guides you through everything step-by-step!

### Manual Setup
Follow the detailed guide: `ENVIRONMENT_SETUP.md`

---

## 📋 Your .env.local Should Look Like:

### Minimal (Demo Mode):
```env
AI_PROVIDER=fallback
NODE_ENV=development
```

### With Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here
AI_PROVIDER=fallback
NODE_ENV=development
```

### Full Production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here
HUGGINGFACE_API_KEY=hf_xxxxx
AI_PROVIDER=huggingface
NODE_ENV=development
```

---

## 🐛 Common Issues

### ❌ "Error: supabaseUrl is required"
**Fix:** Add Supabase keys to `.env.local` OR just use demo mode

### ❌ "AI not responding"
**Fix:** Check that `AI_PROVIDER` is set correctly in `.env.local`

### ❌ "Cannot find module"
**Fix:** Run `npm install` to install dependencies

### ❌ "Port 3000 already in use"
**Fix:** Stop other Next.js apps or use `PORT=3001 npm run dev`

### ❌ ".env.local not found"
**Fix:** File must be in project root with the dot: `.env.local`

---

## 📞 Help & Resources

### Documentation Files:
- **ENVIRONMENT_SETUP.md** - Detailed step-by-step guide
- **SUPABASE_SETUP_GUIDE.md** - Supabase-specific instructions
- **FREE_AI_SETUP.md** - AI provider comparison
- **README.md** - Project overview
- **QUICK_REFERENCE.md** - Common tasks

### Interactive Tools:
- **setup-wizard.sh** - Automated setup script
- Run with: `./setup-wizard.sh`

### Need Help?
1. Check terminal for error messages
2. Check browser console (F12)
3. Review the documentation files above
4. Try demo mode first: `AI_PROVIDER=fallback`

---

## 🎉 Ready to Launch?

Once you've checked off at least **Phase 1**, you're ready to go!

```bash
npm run dev
```

Visit: **http://localhost:3000**

Enjoy SmartProBono Lite! ⚖️✨

