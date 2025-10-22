# 🚀 START HERE - SmartProBono Lite v2

Welcome to **SmartProBono Lite** — an AI legal assistant named **Ermi** that helps small law firms with client intakes and document preparation.

---

## ⚡ Quick Start (5 Minutes)

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Set Up Your Environment**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key
AI_PROVIDER=groq
```

📖 **Need detailed setup help?** → Read `SETUP_GUIDE.md`

### 3. **Set Up Supabase Database**
- Go to your Supabase project → SQL Editor
- Copy the contents of `supabase/schema.sql`
- Run it in the SQL Editor

### 4. **Run the App**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 What You've Got

### **Meet Ermi**
An AI assistant with personality who:
- Reviews intake forms and extracts key facts
- Asks clarifying questions naturally
- Generates professional draft documents
- Always marks outputs as DRAFT for review

### **Core Features**
✅ File upload (PDF, DOCX, TXT)  
✅ AI chat with context awareness  
✅ Information extraction  
✅ Document generation  
✅ Export to DOCX/TXT  
✅ Secure authentication  

---

## 📚 Documentation Guide

**Not sure where to start?** Here's what to read based on your needs:

### 🎓 **I'm New to This Project**
1. Read this file (you're here!)
2. → `SETUP_GUIDE.md` - Detailed setup walkthrough
3. → `ERMI_DEMO_SCRIPT.md` - See how Ermi should behave
4. → `ARCHITECTURE_V2.md` - Understand the system

### 🛠️ **I Want to Customize**
1. → `QUICK_REFERENCE.md` - Find what to change
2. → `FILE_GUIDE.md` - Locate the right file
3. → `lib/prompts/intakePrompt.ts` - Change Ermi's personality

### 🎨 **I Want to See What's New**
1. → `WHATS_NEW_V2.md` - v1 vs v2 changes
2. → `ERMI_DEMO_SCRIPT.md` - See the new conversation style

### 🐛 **Something's Not Working**
1. → `QUICK_REFERENCE.md` - Debug checklist
2. → `SETUP_GUIDE.md` - Troubleshooting section
3. → `README.md` - Common issues

### 🏗️ **I Need Technical Details**
1. → `ARCHITECTURE_V2.md` - Complete architecture
2. → `PROJECT_OVERVIEW.md` - Deep technical dive
3. → `FILE_GUIDE.md` - Every file explained

---

## 🧪 Test It Out

Once running, try these:

### **Test 1: Upload a File**
1. Create a text file with sample client info:
   ```
   Client Name: John Doe
   Case Type: Personal Injury
   Date of Incident: October 1, 2025
   Description: Car accident on Main Street
   ```
2. Upload it to the dashboard
3. Click "Extract Info"

**Expected:** Ermi presents structured summary and asks clarifying questions

---

### **Test 2: Chat with Ermi**
Type: "Generate a client engagement letter"

**Expected:** Ermi creates a professional draft with:
- "DRAFT - FOR ATTORNEY REVIEW" header
- Clear sections
- [PLACEHOLDER] for missing info
- Proactive follow-up: "Would you like me to also create..."

---

### **Test 3: Ask a Question**
Type: "What documents do I need for a custody case?"

**Expected:** Ermi provides helpful checklist without needing a file

---

## 🎭 Understanding Ermi

**Ermi** is the heart of this application. It's not just a chatbot — it's a conversational AI with:

### **Personality:**
- Warm: "Sure thing", "Got it", "On it"
- Professional: Proper formatting, clear structure
- Safe: Never gives legal advice, always marks DRAFT
- Proactive: Suggests next steps

### **Workflow:**
1. **INTAKE** - Accept file or text
2. **EXTRACT** - Identify key facts
3. **CLARIFY** - Ask questions if needed
4. **GENERATE** - Create drafts
5. **ITERATE** - Suggest follow-ups

📖 **See full personality guide:** `ERMI_DEMO_SCRIPT.md`

---

## 🗂️ Project Structure

```
smartprobonoLite/
├── app/                          # Frontend (Next.js)
│   ├── page.tsx                 # Landing + Auth
│   └── dashboard/               # Main app
│       ├── page.tsx             # Dashboard layout
│       └── components/          # UI components
│           ├── ChatBox.tsx      # Chat with Ermi ⭐
│           ├── FileUploader.tsx # Upload files
│           └── OutputViewer.tsx # View/export drafts
│
├── pages/api/                   # Backend API
│   ├── chat.ts                  # AI processing ⭐
│   ├── upload.ts                # File handling
│   └── generate-doc.ts          # Doc generation
│
├── lib/
│   ├── prompts/
│   │   └── intakePrompt.ts      # Ermi's personality ⭐⭐⭐
│   └── utils/                   # Helper functions
│
├── supabase/
│   └── schema.sql               # Database setup
│
└── [Documentation files]
    ├── README.md                # Main docs
    ├── SETUP_GUIDE.md           # Detailed setup
    ├── QUICK_REFERENCE.md       # Quick lookup
    ├── ARCHITECTURE_V2.md       # Technical architecture
    ├── ERMI_DEMO_SCRIPT.md      # Conversation examples
    ├── PROJECT_OVERVIEW.md      # Complete overview
    ├── WHATS_NEW_V2.md          # Changelog
    └── FILE_GUIDE.md            # File reference
```

⭐ = Important  
⭐⭐⭐ = **MOST IMPORTANT** (Ermi's brain!)

---

## 🎯 Key Files to Know

### **For AI Behavior:**
- `lib/prompts/intakePrompt.ts` - **This is where Ermi lives**
- `pages/api/chat.ts` - AI processing logic

### **For UI:**
- `app/dashboard/components/ChatBox.tsx` - Main interface
- `app/page.tsx` - Landing page

### **For Setup:**
- `package.json` - Dependencies
- `supabase/schema.sql` - Database schema
- `.env.local` - Environment variables (you create this)

---

## 🚀 Next Steps

### **After Setup:**
1. ✅ App running on localhost:3000
2. ✅ Can create account and sign in
3. ✅ Can upload a file
4. ✅ Chat with Ermi works
5. ✅ Can download generated documents

### **Then:**
1. Read `ERMI_DEMO_SCRIPT.md` to understand expected behavior
2. Test with real intake forms
3. Customize prompts in `lib/prompts/intakePrompt.ts`
4. Adjust colors in `tailwind.config.ts`
5. Deploy to Vercel (see `QUICK_REFERENCE.md`)

---

## 💡 Common Customizations

### **Change Ermi's Name or Tone:**
Edit `lib/prompts/intakePrompt.ts`:
```typescript
export const AGENT_NAME = "Ermi"; // Change this
```

### **Change Color Scheme:**
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    600: '#0284c7', // Change this
  }
}
```

### **Add Your Firm Name:**
Edit `lib/utils/documentGenerator.ts`:
```typescript
firmName = '[Your Firm Name]' // Change this
```

### **Change AI Model:**
Edit `pages/api/chat.ts`:
```typescript
model: 'llama-3.1-70b-versatile', // Change this
```

---

## 🐛 Troubleshooting

### **"Cannot find module"**
```bash
npm install
```

### **"Invalid API key"**
- Check `.env.local` exists
- Verify GROQ_API_KEY is correct
- Restart dev server

### **Supabase auth not working**
- Verify NEXT_PUBLIC_SUPABASE_URL and key
- Check SQL schema was run
- Ensure project isn't paused

### **AI not responding**
- Check GROQ_API_KEY is valid
- Visit console.groq.com to verify
- Check browser console for errors

📖 **More help:** `SETUP_GUIDE.md` troubleshooting section

---

## 📞 Getting Help

### **Documentation:**
- `SETUP_GUIDE.md` - Setup issues
- `QUICK_REFERENCE.md` - Quick answers
- `ARCHITECTURE_V2.md` - Technical questions
- `FILE_GUIDE.md` - "Where is...?" questions

### **External Resources:**
- [Supabase Docs](https://supabase.com/docs)
- [Groq Docs](https://console.groq.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## ✅ Success Checklist

Before moving forward, verify:

- [ ] `npm install` completed
- [ ] `.env.local` created with all 4 variables
- [ ] Supabase schema loaded
- [ ] App runs on localhost:3000
- [ ] Can create account
- [ ] Can sign in
- [ ] Can upload file
- [ ] Ermi responds to chat
- [ ] Can download documents
- [ ] Read `ERMI_DEMO_SCRIPT.md`

---

## 🎉 You're Ready!

You now have a fully functional AI legal assistant named Ermi.

### **Recommended Next Steps:**
1. ✅ Complete the success checklist above
2. 📖 Read `ERMI_DEMO_SCRIPT.md` for conversation examples
3. 🧪 Test with real intake forms
4. 🎨 Customize to your needs
5. 🚀 Deploy and share!

---

## 📊 Quick Stats

- **Setup Time:** ~10 minutes
- **Lines of Code:** ~2,500
- **Components:** 3 main UI components
- **API Endpoints:** 3 routes
- **AI Provider:** Groq (free tier)
- **Database:** Supabase (free tier)
- **Deployment:** Vercel (free tier)

**Total Cost to Run:** $0 (on free tiers)

---

**Welcome to SmartProBono Lite! Ermi is ready to help.** ⚖️✨

*Questions? Check the docs above or dive into the code!*

