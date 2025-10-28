# SmartProBono Lite – Security Notes

## Overview
SmartProBono Lite is an AI-powered legal assistant for small law firms and legal aid organizations. This document outlines our security practices, data handling, and environment management.

## Environment Variables

### Required Variables
```env
# Supabase (Backend-as-a-Service)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Provider (Groq)
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
```

### Security Practices
1. **Never commit `.env.local`** - This file is gitignored
2. **Use Supabase Dashboard** to manage API keys
3. **Rotate keys regularly** in production
4. **Service role key** should only be used server-side

## Database Security

### Row Level Security (RLS)
All Supabase tables use RLS policies:

- **chats**: Users can only access their own conversations
- **documents**: Users can only access their own documents
- **uploads**: Users can only access their own files

### Policies Implemented
```sql
-- Example policy for chats
CREATE POLICY "Users can view their own chats" 
  ON chats FOR SELECT 
  USING (auth.uid() = user_id);
```

## Data Handling

### User Data
- **Authentication**: Magic link email (Supabase Auth)
- **Storage**: PostgreSQL with RLS
- **Retention**: User data stored until account deletion

### AI Processing
- **Provider**: Groq (Llama 3.3 70B)
- **Data**: Chat history and uploaded documents
- **Processing**: Server-side only (API routes)
- **No PII in logs**: Personal information is not logged

### Document Generation
- **Export formats**: DOCX, PDF (plain text)
- **No cloud storage**: Documents generated on-demand
- **User control**: All exports initiated by user

## API Security

### Chat API (`/api/chat`)
- Validates user authentication
- Strips timestamps before sending to Groq
- Saves conversations to Supabase with RLS

### Document Generation (`/api/generate-doc`)
- User-initiated only
- Returns file as blob
- No persistent storage

### File Upload (`/api/upload`)
- File size limit: 10MB
- Supported types: TXT, PDF, DOCX
- Text extraction only (no file storage)
- Temp files deleted after processing

## Authentication

### Magic Link Flow
1. User enters email on `/login`
2. Supabase sends magic link
3. User clicks link → redirected to `/dashboard`
4. Session token stored in browser (httpOnly cookie)

### Session Management
- **Duration**: Managed by Supabase (default 1 hour)
- **Refresh**: Automatic on activity
- **Logout**: Clears session on all devices

## Compliance Notes

### Legal Disclaimers
- **Not legal advice**: AI outputs are drafts only
- **Attorney review required**: All documents need review
- **Terms of use**: Available at project root

### Data Privacy
- **GDPR**: User data export available via Supabase
- **CCPA**: Right to deletion supported
- **No third-party tracking**: No analytics on production

## Production Deployment

### Netlify Environment
1. Set all required env vars in Netlify dashboard
2. Use Netlify's encrypted environment storage
3. Enable automatic deployments from `main` branch

### Monitoring
- **Logs**: Supabase Dashboard → API logs
- **Errors**: Sentry (optional, not implemented yet)
- **Usage**: Netlify analytics

## Incident Response

### If API Key Leaked
1. Immediately rotate key in provider dashboard
2. Update Netlify environment variables
3. Verify no unauthorized access in Supabase logs
4. Notify affected users if necessary

### If Database Compromised
1. Supabase has automatic backups
2. Restore from latest backup via Supabase Dashboard
3. Audit RLS policies for any vulnerabilities
4. Rotate service role key

## Best Practices for Developers

1. **Never log sensitive data**: Don't console.log() API keys or user data
2. **Use environment variables**: Always use `process.env.VAR_NAME`
3. **Test locally**: Use `.env.local` for development
4. **Review PRs**: All changes must pass security review
5. **Keep dependencies updated**: Run `npm audit` regularly

## Contact
For security concerns: baheem.ferrell@gmail.com

