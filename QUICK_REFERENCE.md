# SmartProBono Lite - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔑 Required Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GROQ_API_KEY=your_groq_key
AI_PROVIDER=groq
```

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page & auth |
| `app/dashboard/page.tsx` | Main dashboard |
| `pages/api/chat.ts` | AI chat endpoint |
| `pages/api/upload.ts` | File upload handler |
| `pages/api/generate-doc.ts` | Document generation |
| `lib/prompts/intakePrompt.ts` | AI prompt templates |
| `supabase/schema.sql` | Database schema |

## 🎨 Customization Points

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    600: '#0284c7', // Change this
  }
}
```

### Customize AI Prompts
Edit `lib/prompts/intakePrompt.ts`

### Add Firm Name
Edit `lib/utils/documentGenerator.ts`:
```typescript
firmName = '[Your Firm Name]'
```

## 🔧 Common Tasks

### Update AI Model
In `pages/api/chat.ts`:
```typescript
model: 'llama-3.1-70b-versatile', // Change this
```

### Change File Size Limit
In `pages/api/upload.ts`:
```typescript
maxFileSize: 10 * 1024 * 1024, // 10MB - change this
```

### Add More File Types
In `lib/utils/textExtraction.ts`:
```typescript
const allowedTypes = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Add more here
];
```

## 🐛 Debug Checklist

- [ ] `.env.local` exists and has all 4 variables
- [ ] Supabase schema has been run in SQL Editor
- [ ] Groq API key is valid (check console.groq.com)
- [ ] `node_modules` folder exists
- [ ] Development server is running on port 3000
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)

## 📊 Features Overview

| Feature | Component | API Endpoint |
|---------|-----------|--------------|
| File Upload | `FileUploader.tsx` | `/api/upload` |
| AI Chat | `ChatBox.tsx` | `/api/chat` |
| Document View | `OutputViewer.tsx` | `/api/generate-doc` |
| Authentication | `app/page.tsx` | Supabase Auth |

## 🔒 Security Features

✅ Row Level Security (RLS) on all tables  
✅ Email verification for new accounts  
✅ Secure file type validation  
✅ File size limits (10MB)  
✅ Environment variables for secrets  
✅ DRAFT watermarks on all generated docs  

## 📱 User Flow

1. **Sign Up** → Email verification
2. **Sign In** → Dashboard
3. **Upload File** → Text extracted
4. **Chat with AI** → Get responses
5. **Generate Doc** → Download DOCX/TXT
6. **Sign Out** → Return to landing

## 💡 AI Prompt Examples

Try these in the chat:

```
"Please extract the key information from this document"

"Generate a client engagement letter for this case"

"What information is missing from this intake form?"

"Create a summary of the main facts"

"Draft a letter to the client explaining next steps"
```

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy!

**Production URL:** `https://your-app.vercel.app`

## 📞 Support Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Groq Docs:** [console.groq.com/docs](https://console.groq.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

## 🎯 Project Stats

- **Lines of Code:** ~2,500
- **Components:** 3 main dashboard components
- **API Routes:** 3 endpoints
- **Database Tables:** 4 tables
- **Supported File Types:** PDF, DOCX, TXT
- **AI Providers:** Groq (Llama 3.1) or Claude

---

**Keep this handy for quick reference!** 📌

