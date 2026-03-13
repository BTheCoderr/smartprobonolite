# SmartProBono Lite - File Guide

Complete reference for every file in the project and its purpose.

---

## 📋 Quick Navigation

- [Documentation](#-documentation-files)
- [Configuration](#%EF%B8%8F-configuration-files)
- [Frontend](#-frontend-files)
- [Backend API](#-backend-api-routes)
- [Libraries & Utils](#-libraries--utilities)
- [Database](#%EF%B8%8F-database)

---

## 📚 Documentation Files

### **README.md**
**Purpose:** Main project documentation  
**Contains:**
- Ermi introduction
- Features overview
- Setup instructions
- Tech stack
- Usage guide
- Troubleshooting

**Read this:** When setting up the project for the first time

---

### **SETUP_GUIDE.md**
**Purpose:** Step-by-step setup walkthrough  
**Contains:**
- Detailed Supabase setup
- Groq API key instructions
- Environment variable configuration
- Test scenarios
- Common issues and solutions

**Read this:** When you need hand-holding through setup

---

### **QUICK_REFERENCE.md**
**Purpose:** Quick lookup for common tasks  
**Contains:**
- Command cheat sheet
- Key files at a glance
- Customization points
- Debug checklist
- Deployment steps

**Read this:** When you need to quickly find how to do something

---

### **PROJECT_OVERVIEW.md**
**Purpose:** Deep technical architecture document  
**Contains:**
- Project vision and goals
- Architecture diagrams
- Security implementation
- Data flow
- Performance considerations
- Future roadmap

**Read this:** When you need to understand the big picture

---

### **ARCHITECTURE_V2.md** ⭐
**Purpose:** AI agent system architecture  
**Contains:**
- Ermi's identity and personality design
- Conversation flow state machine
- Prompt engineering strategy
- API design patterns
- Success metrics
- MVP feature scope

**Read this:** When working on AI features or prompts

---

### **ERMI_DEMO_SCRIPT.md** ⭐
**Purpose:** Conversation examples and personality guide  
**Contains:**
- Complete demo conversations
- Personality trait examples
- Sample phrases Ermi uses
- Testing checklist
- Multiple scenario examples

**Read this:** Before demoing or testing Ermi's responses

---

### **WHATS_NEW_V2.md** ⭐
**Purpose:** Changelog and improvements in v2  
**Contains:**
- v1 vs v2 comparison
- New features
- Technical changes
- Testing guide
- Before/after examples

**Read this:** To understand what changed from v1 to v2

---

### **FILE_GUIDE.md** (this file)
**Purpose:** Reference for all files in the project  
**Read this:** When you're not sure what a file does

---

## ⚙️ Configuration Files

### **package.json**
**Purpose:** Node.js dependencies and scripts  
**Contains:**
- All npm packages
- Scripts: `dev`, `build`, `start`, `lint`
- Project metadata

**Modify this:** When adding new npm packages

---

### **tsconfig.json**
**Purpose:** TypeScript compiler configuration  
**Contains:**
- Compilation settings
- Path aliases (`@/*`)
- Include/exclude rules

**Modify this:** Rarely (usually leave as-is)

---

### **tailwind.config.ts**
**Purpose:** Tailwind CSS configuration  
**Contains:**
- Color palette (primary blues)
- Theme extensions
- Content paths

**Modify this:** To customize colors or add design tokens

---

### **postcss.config.js**
**Purpose:** PostCSS configuration for Tailwind  
**Modify this:** Never (leave as-is)

---

### **next.config.js**
**Purpose:** Next.js configuration  
**Contains:**
- React strict mode
- Build settings

**Modify this:** To add environment variables or custom webpack config

---

### **.gitignore**
**Purpose:** Git ignore rules  
**Contains:**
- `node_modules/`
- `.env.local`
- `.next/`
- Build artifacts

**Modify this:** To ignore additional files

---

## 🎨 Frontend Files

### **app/layout.tsx**
**Purpose:** Root layout component  
**Contains:**
- HTML structure
- Font loading (Inter)
- Global metadata
- CSS imports

**Modify this:** To change app-wide settings or add global providers

---

### **app/globals.css**
**Purpose:** Global styles  
**Contains:**
- Tailwind imports
- Custom scrollbar styles
- CSS variables

**Modify this:** To add global styles or CSS variables

---

### **app/page.tsx** ⭐
**Purpose:** Landing page with authentication  
**Contains:**
- Sign up / Sign in form
- Hero section with Ermi introduction
- Feature cards
- Auth logic with Supabase

**Modify this:** To change landing page copy or design

---

### **app/dashboard/layout.tsx**
**Purpose:** Dashboard layout wrapper  
**Contains:**
- Auth protection (redirects if not logged in)
- Header with user email and sign out
- Auth state management

**Modify this:** To change dashboard header or add navigation

---

### **app/dashboard/page.tsx**
**Purpose:** Main dashboard orchestrator  
**Contains:**
- Two-pane layout (Chat/Upload left, Output right)
- State management for uploaded files and generated output
- Component composition

**Modify this:** To change dashboard layout or add new features

---

### **app/dashboard/components/ChatBox.tsx** ⭐
**Purpose:** Chat interface with Ermi  
**Contains:**
- Message display (user and assistant)
- Input field and send button
- "Extract Info" button
- API calls to `/api/chat`
- Ermi's personality in greeting

**Modify this:** To change chat UI or add features like voice input

---

### **app/dashboard/components/FileUploader.tsx**
**Purpose:** File upload component  
**Contains:**
- Drag-and-drop interface
- File validation (type, size)
- API call to `/api/upload`
- Visual feedback

**Modify this:** To support more file types or change upload UI

---

### **app/dashboard/components/OutputViewer.tsx**
**Purpose:** Document preview and export  
**Contains:**
- Display generated content
- Copy to clipboard button
- Download as DOCX/TXT buttons
- Empty state UI

**Modify this:** To add inline editing or version history

---

## 🔌 Backend API Routes

### **pages/api/chat.ts** ⭐
**Purpose:** AI chat processing endpoint  
**Route:** `POST /api/chat`  
**Contains:**
- Groq API integration
- Context building (last 5 messages)
- Mode handling (`chat` vs `extract`)
- Prompt selection
- Error handling

**Modify this:** To change AI model, adjust temperature, or switch to Claude

---

### **pages/api/upload.ts**
**Purpose:** File upload and text extraction  
**Route:** `POST /api/upload`  
**Contains:**
- Formidable file parsing
- PDF text extraction (pdf-parse)
- DOCX text extraction (mammoth)
- TXT file reading
- File validation

**Modify this:** To add support for new file types

---

### **pages/api/generate-doc.ts**
**Purpose:** Document generation and download  
**Route:** `POST /api/generate-doc`  
**Contains:**
- AI content generation
- DOCX creation (docx library)
- TXT formatting
- File streaming for download

**Modify this:** To add new document formats or custom templates

---

## 📚 Libraries & Utilities

### **lib/supabaseClient.ts**
**Purpose:** Supabase client initialization  
**Contains:**
- Client instance
- TypeScript types (Profile, Chat, Document, UploadedFile)
- Environment variable configuration

**Modify this:** To add new database types

---

### **lib/prompts/intakePrompt.ts** ⭐⭐⭐
**Purpose:** All AI prompts and personality  
**Contains:**
- `AGENT_NAME` = "Ermi"
- `systemPrompt` - Ermi's personality and guidelines
- `intakePrompt` - General chat prompt
- `extractionPrompt` - Information extraction
- `documentGenerationPrompt` - Draft creation
- `summaryPrompt` - Conversation summary

**Modify this:** To change Ermi's personality, add new prompts, or refine responses

**⭐ MOST IMPORTANT FILE FOR AI BEHAVIOR ⭐**

---

### **lib/utils/textExtraction.ts**
**Purpose:** Client-side text extraction utilities  
**Contains:**
- File type validation
- File size formatting
- Basic text extraction
- Error handling

**Modify this:** To add client-side file processing

---

### **lib/utils/documentGenerator.ts**
**Purpose:** Document formatting utilities  
**Contains:**
- `generateDocxDocument()` - Creates DOCX with docx library
- `generatePlainTextDocument()` - Creates formatted TXT
- DRAFT watermark logic
- Firm name placeholder

**Modify this:** To change document formatting or add custom branding

---

## 🗄️ Database

### **supabase/schema.sql** ⭐
**Purpose:** Complete database schema  
**Contains:**
- `profiles` table (user info)
- `chats` table (conversation history)
- `documents` table (generated drafts)
- `uploaded_files` table (file metadata)
- Row Level Security (RLS) policies
- Storage bucket configuration

**Use this:** Run in Supabase SQL Editor during setup

**Modify this:** To add new tables or change schema

---

## 🎯 Files by Priority

### **Must Understand:**
1. `lib/prompts/intakePrompt.ts` - Ermi's brain
2. `app/dashboard/components/ChatBox.tsx` - Main UI
3. `pages/api/chat.ts` - AI processing
4. `ARCHITECTURE_V2.md` - System design
5. `ERMI_DEMO_SCRIPT.md` - Expected behavior

### **Important for Setup:**
1. `README.md` or `SETUP_GUIDE.md`
2. `package.json`
3. `supabase/schema.sql`
4. Environment variables (`.env.local`)

### **Reference When Needed:**
1. `QUICK_REFERENCE.md`
2. `FILE_GUIDE.md` (this file)
3. `PROJECT_OVERVIEW.md`
4. `WHATS_NEW_V2.md`

---

## 📝 Typical Workflow

### **For New Developers:**
1. Read `SETUP_GUIDE.md`
2. Set up environment
3. Read `ERMI_DEMO_SCRIPT.md` to understand Ermi
4. Read `ARCHITECTURE_V2.md` to understand system
5. Explore code starting with `app/dashboard/page.tsx`

### **For Customization:**
1. **Change Ermi's personality:** Edit `lib/prompts/intakePrompt.ts`
2. **Change UI colors:** Edit `tailwind.config.ts`
3. **Add new document type:** Update `lib/prompts/intakePrompt.ts` and `pages/api/generate-doc.ts`
4. **Change AI model:** Edit `pages/api/chat.ts`
5. **Add new page:** Create in `app/` directory

### **For Debugging:**
1. Check `QUICK_REFERENCE.md` debug checklist
2. Verify environment variables
3. Check browser console (F12)
4. Check terminal where `npm run dev` is running
5. Review API responses in Network tab

---

## 🚀 Key Takeaways

- **Most AI magic happens in:** `lib/prompts/intakePrompt.ts`
- **Main user experience:** `app/dashboard/components/ChatBox.tsx`
- **Best documentation:** `ARCHITECTURE_V2.md` + `ERMI_DEMO_SCRIPT.md`
- **Quick setup:** `SETUP_GUIDE.md`
- **Quick reference:** `QUICK_REFERENCE.md`

---

**Now you know where everything is!** 🎯

