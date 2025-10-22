# SmartProBono Lite v2 - AI Agent Architecture

## 🎯 Core Philosophy

**One clear goal:** Prove that an AI agent (Ermi) can understand client intakes, extract facts, ask clarifying questions, and generate usable drafts — all without overengineering.

---

## 🤖 Agent Identity: Ermi

**Name:** Ermi  
**Role:** AI Legal Assistant (Paralegal-level)  
**Tone:** Professional but conversational  
**Core Promise:** Organize facts, format text, prepare editable drafts — never give legal advice

### Personality Traits
- **Warm:** "Sure thing", "Got it", "On it"
- **Structured:** Clear bullet points, headers, formatting
- **Safe:** Always marks DRAFT, uses [PLACEHOLDER], attorney review required
- **Proactive:** "Would you like me to..." / "Anything else..."

---

## 🔄 Conversation Flow (Micro State Machine)

### **State 1: INTAKE**
- User uploads document or starts chat
- Ermi: "Hi! I'm Ermi, your AI legal assistant..."
- **Action:** Accept file or text input

### **State 2: EXTRACT**
- Parse uploaded text or conversation
- Identify: Client name, case type, dates, jurisdiction, key facts
- **Prompt:** `extractionPrompt(uploadedText)`
- **Output:** Friendly structured summary with bullets

### **State 3: CLARIFY** (if needed)
- If info is missing/ambiguous, ask 1-2 focused questions
- Example: "Before I prepare a draft, could you confirm whether this is for initial filing or modification?"
- **Trigger:** AI detects uncertainty or missing critical fields
- **Wait for:** User response, then update context

### **State 4: GENERATE**
- Create professional draft document
- **Prompt:** `documentGenerationPrompt(type, clientInfo, instructions)`
- **Output:** Formatted draft with:
  - "DRAFT - FOR ATTORNEY REVIEW" header
  - Clear sections and headers
  - [PLACEHOLDER] for missing data
  - Signature/date placeholders

### **State 5: ITERATE**
- Offer export (DOCX/TXT)
- Suggest related documents
- **Prompt ends with:** "Would you like me to also create [related doc]?"
- **Stay engaged** for follow-up edits or questions

---

## 🧠 Prompt Engineering Strategy

### **System Prompt (Identity)**
```
You are Ermi, an AI legal assistant for small law firms.
You organize client intakes and prepare drafts for attorney review.
You do NOT give legal advice.

Personality: Warm, conversational, proactive
Workflow: EXTRACT → CLARIFY → GENERATE → ASSIST
```

### **Intake Extraction Prompt**
```
Read this intake text. Extract:
- Client Name
- Opposing Party (if any)
- Case Type
- Key Dates
- Jurisdiction
- Summary of Facts

Present conversationally:
"I've reviewed the file — it looks like [case]. Here's what I've gathered..."

If unclear, ask up to 2 focused questions.
```

### **Document Generation Prompt**
```
Generate a professional [document type] based on:
- Client/Case info: [structured data]
- Instructions: [user request]

Requirements:
- Include "DRAFT - FOR ATTORNEY REVIEW"
- Use [PLACEHOLDER] for missing info
- Clear headers and sections
- Professional formatting

End with: "Would you like me to also create..."
```

### **Clarification Prompt**
```
If user's answer adds new facts:
- Merge into existing understanding
- Update structured summary
- Regenerate or proceed to draft
```

---

## 🗄️ Data Architecture (Supabase)

### **Tables**

#### **users**
- `id` (UUID, primary key, references auth.users)
- `email` (text)
- `created_at` (timestamp)

#### **chats**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `messages` (JSONB array)
  ```json
  [
    {"role": "assistant", "content": "Hi! I'm Ermi...", "timestamp": "..."},
    {"role": "user", "content": "...", "timestamp": "..."}
  ]
  ```
- `created_at`, `updated_at` (timestamps)

#### **documents**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `chat_id` (UUID, foreign key → chats, nullable)
- `title` (text)
- `content` (text, the generated draft)
- `document_type` (text, e.g., "Motion", "Letter")
- `created_at` (timestamp)

#### **uploads**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `file_name` (text)
- `file_type` (text)
- `extracted_text` (text)
- `storage_path` (text, Supabase Storage URL)
- `created_at` (timestamp)

### **Row Level Security (RLS)**
- All tables: Users can only access their own data
- Policy: `auth.uid() = user_id`

---

## 🏗️ Frontend Structure

### **Two-Pane Dashboard Layout**

```
┌─────────────────────────────────────────────┐
│  Left Pane          │  Right Pane           │
│                     │                       │
│  FileUploader.tsx   │  OutputViewer.tsx     │
│  ↓                  │  - Preview draft      │
│  ChatBox.tsx        │  - Copy to clipboard  │
│  - Chat with Ermi   │  - Export DOCX/TXT    │
│  - Extract button   │  - Edit inline (v2)   │
└─────────────────────────────────────────────┘
```

### **Component Responsibilities**

#### **ChatBox.tsx**
- Display conversation with Ermi
- Send user messages to `/api/chat`
- Show "Extract Info" button when file uploaded
- Conversational UI (warm, friendly)

#### **FileUploader.tsx**
- Drag-and-drop interface
- POST to `/api/upload`
- Extract text from PDF/DOCX/TXT
- Pass `extractedText` to ChatBox

#### **OutputViewer.tsx**
- Display generated drafts
- Copy to clipboard
- Download as DOCX or TXT
- (Future: Inline editing)

---

## 🔌 API Routes

### **POST `/api/chat`**
**Purpose:** Process chat messages with Ermi

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hey Ermi, review this intake"},
    {"role": "assistant", "content": "Sure thing..."}
  ],
  "uploadedText": "optional context from file",
  "mode": "chat" | "extract"
}
```

**Logic:**
1. Build context from last 5 messages
2. Determine prompt based on mode:
   - `mode: "extract"` → Use `extractionPrompt(uploadedText)`
   - `mode: "chat"` → Use `intakePrompt(context, uploadedText)`
3. Call Groq/Claude API
4. Return AI response

**Response:**
```json
{
  "message": "I've reviewed the file — it looks like...",
  "success": true
}
```

---

### **POST `/api/upload`**
**Purpose:** Handle file upload and text extraction

**Request:** FormData with `file`

**Logic:**
1. Validate file type (PDF, DOCX, TXT)
2. Validate file size (≤10MB)
3. Extract text:
   - PDF: `pdf-parse`
   - DOCX: `mammoth`
   - TXT: read directly
4. Return extracted text

**Response:**
```json
{
  "success": true,
  "fileName": "intake_form.pdf",
  "extractedText": "Client Name: John Doe..."
}
```

---

### **POST `/api/generate-doc`**
**Purpose:** Generate downloadable DOCX or TXT

**Request Body:**
```json
{
  "documentType": "Motion to Modify Custody",
  "clientInfo": "Maria Lopez v. Carlos Lopez...",
  "instructions": "Generate based on conversation...",
  "format": "docx" | "txt"
}
```

**Logic:**
1. Call AI to generate content using `documentGenerationPrompt`
2. Format as DOCX (using `docx` library) or TXT
3. Add "DRAFT - FOR ATTORNEY REVIEW" header
4. Return as downloadable file

**Response:** Binary file stream with appropriate headers

---

## 🎯 Proof-of-Concept Success Metrics

| Metric | Goal | How to Measure |
|--------|------|----------------|
| Time to first draft | < 60 seconds | Upload → Generate → Download |
| Extraction accuracy | 80%+ | Manual review of extracted fields |
| Lawyer satisfaction | 4/5 stars | Post-demo feedback |
| Output reusability | ≥1 exported doc | Download analytics |

---

## 🚀 MVP Feature Scope

### **Must Have (v0.1)**
✅ User authentication (Supabase)  
✅ File upload (PDF, DOCX, TXT)  
✅ Text extraction  
✅ Chat with Ermi  
✅ Information extraction with clarification  
✅ Draft document generation  
✅ Export to DOCX/TXT  
✅ Conversation history (last 5 messages)  

### **Nice to Have (v0.2)**
🔲 Inline draft editing  
🔲 Save conversations to database  
🔲 Document version history  
🔲 Custom templates  
🔲 Email integration  

### **Future (v1.0+)**
🔲 RAG for case law snippets  
🔲 Multi-step workflows (LangGraph)  
🔲 Role-based assistants (intake agent, paralegal, lawyer)  
🔲 Timeline and deadline tracking  
🔲 Team collaboration  

---

## 🧪 Testing & Validation

### **Manual Test Scenarios**

#### **Scenario 1: Family Law Intake**
1. Upload PDF intake form
2. Click "Extract Info"
3. Ermi should: Present structured summary, ask clarifying question
4. Answer question
5. Request: "Generate a motion to modify custody"
6. Verify: Draft has DRAFT header, [PLACEHOLDER] for missing info
7. Download DOCX

#### **Scenario 2: Contract Dispute**
1. Paste text: "Client John Smith hired ABC Construction..."
2. Ermi should: Extract client, opposing party, case type
3. Ask: "Do you have a written contract?"
4. Answer: "Yes, $50k total, $15k deposit"
5. Request: "Draft a demand letter"
6. Verify: Professional format, attorney review note

#### **Scenario 3: Quick Question**
1. Type: "What documents do I need for a car accident intake?"
2. Ermi should: Provide checklist without requiring file upload
3. Offer: "Would you like me to create a checklist template?"

---

## 🔒 Security & Compliance

### **Data Privacy**
- RLS on all Supabase tables
- User data isolated by `user_id`
- Files stored in Supabase Storage with bucket policies

### **Legal Safety**
- All outputs marked "DRAFT - FOR ATTORNEY REVIEW"
- Ermi never gives legal advice
- [PLACEHOLDER] for uncertain information
- System prompt reinforces safety guardrails

### **API Security**
- Environment variables for API keys
- No client-side exposure of secrets
- Rate limiting via AI provider

---

## 📊 Technical Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Auth** | Supabase Auth |
| **AI** | Groq (Llama 3.1 70B) or Claude 3 Sonnet |
| **File Processing** | mammoth (DOCX), pdf-parse (PDF) |
| **Doc Generation** | docx library |
| **Deployment** | Vercel (recommended) |

---

## 🎬 What's Next?

### **Immediate (Week 1-2)**
1. ✅ Core functionality working (DONE)
2. ✅ Ermi personality implemented (DONE)
3. Test with real intake forms
4. Demo to 2-3 attorneys
5. Collect feedback

### **Short-term (Month 1)**
1. Add inline editing to OutputViewer
2. Save conversation history to database
3. Implement document templates library
4. Polish UI/UX based on feedback

### **Medium-term (Months 2-3)**
1. RAG integration for jurisdiction-specific guidance
2. Multi-document comparison
3. Email integration for client communication
4. Calendar and deadline tracking

### **Long-term (6+ months)**
1. Team collaboration features
2. Practice management integrations
3. Advanced workflow automation
4. Mobile app version

---

**Built with a clear vision: Lightweight, powerful, and lawyer-friendly.** ⚖️✨

