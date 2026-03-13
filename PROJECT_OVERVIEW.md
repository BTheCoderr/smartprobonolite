# SmartProBono Lite - Project Overview

## 🎯 Project Vision

SmartProBono Lite is an AI-powered legal intake assistant designed specifically for small law firms. It streamlines the client intake process by combining document upload, AI extraction, conversational assistance, and automated document generation into a single, easy-to-use platform.

## ✨ Core MVP Features Delivered

### 1. **Secure Authentication System**
- Email-based signup and signin
- Supabase authentication with email verification
- Protected dashboard routes
- Session management

### 2. **Intelligent File Upload**
- Drag-and-drop interface
- Support for PDF, DOCX, and TXT files
- Automatic text extraction
- Visual feedback and validation
- 10MB file size limit

### 3. **AI Chat Assistant**
- Context-aware conversational interface
- Maintains conversation history (last 5 messages)
- Can extract key information from documents
- Answers questions about legal procedures
- Generates draft documents on request
- Real-time streaming responses

### 4. **Document Generation**
- AI-powered content creation
- Export to DOCX or TXT formats
- Professional formatting
- DRAFT watermarks for attorney review
- Firm name customization ready

### 5. **Output Management**
- Real-time document preview
- Copy to clipboard functionality
- Download in multiple formats
- Clean, readable formatting

## 🏗️ Architecture

### Frontend (Next.js 14 App Router)
```
app/
├── page.tsx                    # Landing page with auth UI
├── layout.tsx                  # Root layout with metadata
├── globals.css                 # Tailwind styles
└── dashboard/
    ├── layout.tsx              # Auth wrapper & header
    ├── page.tsx                # Main dashboard orchestrator
    └── components/
        ├── ChatBox.tsx         # AI conversation interface
        ├── FileUploader.tsx    # File upload with drag-drop
        └── OutputViewer.tsx    # Document preview & export
```

### Backend (API Routes)
```
pages/api/
├── chat.ts                     # AI chat processing (Groq/Claude)
├── upload.ts                   # File upload & text extraction
└── generate-doc.ts             # DOCX/TXT document generation
```

### Libraries & Utilities
```
lib/
├── supabaseClient.ts           # Database client & TypeScript types
├── prompts/
│   └── intakePrompt.ts         # AI prompt engineering
└── utils/
    ├── textExtraction.ts       # File parsing utilities
    └── documentGenerator.ts    # DOCX generation with docx library
```

### Database (Supabase/PostgreSQL)
```
supabase/
└── schema.sql                  # Complete database schema with RLS
    ├── profiles                # User profiles
    ├── chats                   # Conversation history
    ├── documents               # Generated documents
    └── uploaded_files          # File metadata
```

## 🔐 Security Implementation

### Row Level Security (RLS)
Every table has RLS enabled with policies ensuring:
- Users can only view their own data
- Users can only modify their own records
- Automatic user_id association on inserts

### Authentication
- Supabase Auth with email verification
- Secure session management
- Client-side and server-side auth checks
- Protected routes with redirect logic

### File Security
- File type validation (client & server)
- File size limits enforced
- Sanitized file processing
- Storage bucket policies

### API Security
- Environment variable management
- No API keys exposed to client
- Rate limiting via provider (Groq/Claude)
- Error handling without leaking sensitive data

## 🤖 AI Integration

### Provider: Groq (Default)
- **Model:** Llama 3.1 70B Versatile
- **Max Tokens:** 2000-3000 depending on task
- **Temperature:** 0.7 for balanced creativity
- **Free tier available**

### Provider: Claude (Alternative)
- **Model:** Claude 3 Sonnet
- **Easy switch in configuration**
- **Code ready, just needs API key**

### Prompt Engineering
Four specialized prompts:
1. **Intake Prompt** - General assistant behavior
2. **Extraction Prompt** - Structured information extraction
3. **Document Generation Prompt** - Formal document creation
4. **Summary Prompt** - Conversation summarization

## 📊 Data Flow

### User Journey Flow
```
Landing Page (Auth)
    ↓
Dashboard (Protected)
    ↓
Upload File → Text Extraction → Context Stored
    ↓
Chat with AI → Process Messages → AI Response
    ↓
Generate Document → AI Creates Content → Export
    ↓
Download DOCX/TXT → Local Save
```

### API Request Flow
```
Client Component
    ↓
API Route (Server)
    ↓
External Service (Groq/Supabase)
    ↓
Response Processing
    ↓
Client Update
```

## 🎨 UI/UX Design

### Design Principles
- **Clean & Professional** - Appropriate for legal context
- **Intuitive Navigation** - Minimal learning curve
- **Visual Feedback** - Loading states, success/error messages
- **Responsive Layout** - Works on desktop (primary) and tablets
- **Accessibility** - Semantic HTML, keyboard navigation

### Color Scheme
- **Primary:** Blue tones (#0ea5e9 - trustworthy, professional)
- **Success:** Green (#10b981)
- **Error:** Red (#ef4444)
- **Neutral:** Grays for text and backgrounds

### Component Library
Built entirely with Tailwind CSS utility classes - no external component library needed.

## 📦 Dependencies

### Core
- `next` (14.1.0) - React framework
- `react` (18.2.0) - UI library
- `typescript` (5.3.3) - Type safety

### Database
- `@supabase/supabase-js` (2.39.0) - Supabase client

### AI
- `groq-sdk` (0.3.0) - Groq API client

### File Processing
- `mammoth` (1.6.0) - DOCX text extraction
- `pdf-parse` (1.1.1) - PDF text extraction
- `formidable` (3.5.1) - File upload handling

### Document Generation
- `docx` (8.5.0) - DOCX creation

### Styling
- `tailwindcss` (3.4.1) - Utility-first CSS
- `autoprefixer` (10.4.17) - CSS compatibility
- `postcss` (8.4.33) - CSS processing

## 🚀 Performance Considerations

### Optimizations
- Server-side rendering where appropriate
- Client-side state management for interactivity
- Lazy loading of large components
- Efficient database queries with RLS
- File size limits to prevent overload

### Scalability Notes
- Stateless API design
- Database connection pooling via Supabase
- File storage in Supabase storage (not database)
- Message history limited to last 5 for context

## 📈 Future Enhancement Opportunities

### Phase 2 (Expand MVP)
- [ ] Document template library
- [ ] Multi-file comparison
- [ ] Advanced search and filtering
- [ ] Export conversation transcripts
- [ ] Email integration

### Phase 3 (Team Features)
- [ ] Multi-user workspaces
- [ ] Case assignment and routing
- [ ] Collaborative editing
- [ ] Activity logs and audit trails
- [ ] Role-based access control

### Phase 4 (Advanced AI)
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Custom model fine-tuning
- [ ] Multi-step workflows with LangGraph
- [ ] Automated form filling
- [ ] Calendar and deadline tracking

### Phase 5 (Integrations)
- [ ] Practice management software APIs
- [ ] Court filing systems
- [ ] E-signature services
- [ ] Payment processing
- [ ] CRM integration

## 🧪 Testing Recommendations

### Manual Testing Checklist
- [ ] User signup and email verification
- [ ] User signin and session persistence
- [ ] File upload (TXT, PDF, DOCX)
- [ ] Chat responses
- [ ] Information extraction
- [ ] Document generation
- [ ] DOCX download
- [ ] TXT download
- [ ] Copy to clipboard
- [ ] Sign out and redirect

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests with Playwright/Cypress
- Component tests with React Testing Library

## 📚 Documentation Provided

1. **README.md** - Comprehensive overview, features, setup
2. **SETUP_GUIDE.md** - Step-by-step setup instructions
3. **QUICK_REFERENCE.md** - Quick reference for common tasks
4. **PROJECT_OVERVIEW.md** (this file) - Deep dive into architecture

## 🎓 Learning Resources

This project demonstrates:
- Next.js 14 App Router patterns
- Supabase authentication and database
- AI API integration (Groq/Claude)
- File upload and processing
- Document generation
- TypeScript best practices
- Tailwind CSS styling
- Row Level Security implementation

## 💰 Cost Considerations

### Free Tier (Development)
- **Supabase:** Free tier includes 500MB database, 1GB storage
- **Groq:** Free tier with rate limits
- **Vercel:** Free tier for hobby projects
- **Total:** $0/month for development and low usage

### Production Estimates
- **Supabase Pro:** $25/month (for serious usage)
- **Groq:** Pay-as-you-go or contact for pricing
- **Vercel Pro:** $20/month (optional, for team features)
- **Total:** ~$45-50/month for small firm usage

## 🏆 Success Criteria Achieved

✅ **Lawyer can log in** - Supabase auth implemented  
✅ **Upload intake form** - Full file upload with extraction  
✅ **AI extracts key facts** - Specialized extraction mode  
✅ **AI generates draft doc** - DOCX and TXT generation  
✅ **Lawyer reviews + exports** - Preview and download  
✅ **Secure data storage** - RLS on all tables  
✅ **Professional UI** - Clean, modern design  
✅ **Complete in under 2 weeks** - MVP ready!  

## 🎯 Proof Points Delivered

✅ Lawyers interact with a real AI "assistant" - ChatBox component  
✅ One document fully generated and exportable - generate-doc API  
✅ Conversations saved securely - Supabase with RLS  

**Status: MVP COMPLETE** ✨

---

**Built as a proof-of-concept demonstrating AI + workflow + tangible output**

*This is SmartProBono = trusted local AI assistant for small law firms*

