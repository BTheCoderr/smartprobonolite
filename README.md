# SmartProBono Lite ⚖️

**AI-Powered Legal Intake Assistant for Small Law Firms**

SmartProBono Lite is a Next.js application that helps small law firms and legal aid offices automate client intake and document drafting using AI. Built with modern web technologies and designed for real-world legal practice.

## 🔗 Live Demo

- **Demo (no data saved)**: https://smartprobonolite.netlify.app/demo
- **Pilot Dashboard (auth + persistence)**: https://smartprobonolite.netlify.app/dashboard
- **Repo**: https://github.com/BTheCoderr/smartprobonolite

## 📚 Security & Pilot Docs

- See [SECURITY_NOTE.md](./SECURITY_NOTE.md) for data handling, RLS, and env practices.
- See [PILOT_GUIDE.md](./PILOT_GUIDE.md) for attorney instructions, disclaimers, and feedback loop.

## 📧 Contact

- **Baheem Ferrell** — bferrell@smartprobono.org

## 🎯 Project Overview

This project demonstrates the integration of AI technology in legal practice, specifically focusing on:
- **Client Intake Automation**: Extract key facts from uploaded documents
- **Document Generation**: Create draft legal documents using AI
- **User Management**: Complete authentication and profile system
- **Data Persistence**: Secure storage of conversations and documents

## 🚀 Features

### Core Functionality
- **AI Legal Assistant (Ermi)**: Conversational AI that helps with legal document preparation
- **Document Upload**: Support for PDF, DOCX, and text files
- **Text Extraction**: Automatic extraction of text from uploaded documents
- **Document Generation**: Create draft letters, agreements, and legal forms
- **Export Options**: Download generated documents as DOCX or PDF

### User Management
- **Magic Link Authentication**: Secure email-based login system
- **User Profiles**: Store attorney and firm information
- **Chat History**: Persistent conversation storage
- **Document Library**: Access to all generated documents

### Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Chat**: Interactive conversation with AI assistant
- **Secure Data**: Row Level Security (RLS) for data protection
- **Modern UI**: Clean, professional legal-tech interface

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects

### Backend & Database
- **Supabase**: PostgreSQL database with authentication
- **Row Level Security**: Data protection and user isolation
- **RESTful APIs**: Next.js API routes for backend logic

### AI Integration
- **Groq API**: High-performance AI model integration
- **Hugging Face**: Alternative AI provider support
- **Custom Prompts**: Legal-specific AI instruction sets

### File Processing
- **PDF-Parse**: PDF text extraction
- **Mammoth**: DOCX file processing
- **Docx Library**: Document generation and export

## 📁 Project Structure

```
smartprobono-lite/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Main application interface
│   │   ├── components/         # Dashboard components
│   │   ├── layout.tsx          # Dashboard layout with auth
│   │   └── page.tsx            # Main dashboard page
│   ├── login/                  # Authentication pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── lib/                        # Utility libraries
│   ├── hooks/                  # Custom React hooks
│   ├── prompts/               # AI prompt templates
│   ├── supabaseClient.ts      # Database client
│   └── utils/                 # Helper functions
├── pages/api/                 # API endpoints
│   ├── chat.ts                # AI chat endpoint
│   ├── generate-doc.ts        # Document generation
│   ├── upload.ts              # File upload handling
│   └── early-access.ts        # Email collection
├── supabase/                  # Database schema
│   └── schema.sql             # Database structure
├── public/                    # Static assets
└── docs/                      # Documentation files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Groq API key (or Hugging Face API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BTheCoderr/smartprobonolite.git
   cd smartprobonolite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI Provider Configuration
   AI_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key
   HUGGINGFACE_API_KEY=your_huggingface_key

   # Email Service (Optional)
   RESEND_API_KEY=your_resend_api_key

   # Analytics (Optional but recommended)
    NEXT_PUBLIC_POSTHOG_KEY=your_posthog_public_key
    NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
    POSTHOG_SECRET_KEY=your_posthog_secret_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Enable Row Level Security

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles**: User information and firm details
- **chats**: Conversation history with AI assistant
- **documents**: Generated legal documents
- **uploaded_files**: File metadata and extracted text

All tables include Row Level Security (RLS) for data protection.

## 🔧 Configuration

### AI Provider Setup
### Analytics (PostHog)

PostHog is wired in for product analytics, funnels, and organization-level reporting. To enable it:

1. Create a PostHog project (Cloud or self-hosted) and copy the **Project API Key** and **Host**.
2. Add the `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, and `POSTHOG_SECRET_KEY` variables to `.env.local`.
3. Deploy the same variables to Netlify/Vercel.

Once configured, the app will automatically capture:

- Demo and early access CTA clicks
- Intake uploads (success/error)
- Chat interactions and AI generations
- Document downloads/copies
- Supabase auth events (user + organization grouping)

Custom events can be added anywhere via `captureEvent('event_name', { ...props })` from `@/lib/posthogClient`.
The application supports multiple AI providers:

1. **Groq (Recommended)**: Fast, free tier available
2. **Hugging Face**: Free inference API
3. **Fallback Mode**: Rule-based responses when no API key

### Supabase Setup
1. Create a new Supabase project
2. Run the provided SQL schema
3. Configure authentication settings
4. Set up Row Level Security policies

## 🎨 UI/UX Design

The application features a clean, professional design suitable for legal professionals:

- **Color Scheme**: Blue and gray palette for trust and professionalism
- **Typography**: Clean, readable fonts
- **Layout**: Two-pane design (chat + document viewer)
- **Responsive**: Mobile-friendly interface
- **Accessibility**: Keyboard navigation and screen reader support

## 🔒 Security Features

- **Authentication**: Magic link-based secure login
- **Data Protection**: Row Level Security (RLS)
- **Input Validation**: Sanitized user inputs
- **API Security**: Protected endpoints with authentication
- **File Upload Safety**: Type validation and size limits

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Supabase query caching
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Optimized JavaScript bundles

## 🧪 Testing

The application includes:
- **API Testing**: Endpoint validation
- **Authentication Testing**: Login/logout flows
- **File Upload Testing**: Document processing
- **AI Integration Testing**: Response validation

## 📝 API Documentation

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "messages": [{"role": "user", "content": "message"}],
  "uploadedText": "optional extracted text",
  "mode": "chat" | "extract"
}
```

### Document Generation
```
POST /api/generate-doc
Content-Type: application/json

{
  "documentType": "letter",
  "clientInfo": "client details",
  "instructions": "specific requirements",
  "format": "docx" | "txt"
}
```

## 🤝 Contributing

This is a class project demonstrating modern web development practices. Contributions are welcome for:

- Bug fixes and improvements
- Additional AI provider integrations
- UI/UX enhancements
- Documentation improvements
- Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Baheem Ferrell**
- GitHub: [@BTheCoderr](https://github.com/BTheCoderr)
- Project: SmartProBono Lite

## 🙏 Acknowledgments

- **Supabase**: Database and authentication services
- **Groq**: AI model hosting and inference
- **Next.js Team**: React framework and tooling
- **Tailwind CSS**: Utility-first CSS framework
- **Legal Community**: Inspiration and feedback

## 📚 Class Project Context

This project was developed as part of a software engineering course, demonstrating:

- **Full-Stack Development**: Frontend and backend integration
- **Modern Web Technologies**: Next.js, TypeScript, Tailwind CSS
- **Database Design**: PostgreSQL with proper relationships
- **AI Integration**: Real-world AI application development
- **User Experience**: Professional-grade interface design
- **Security Best Practices**: Authentication and data protection
- **Deployment Ready**: Production-ready application architecture

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

See the deployment documentation for platform-specific instructions.

---

**Built with ❤️ for the legal community**