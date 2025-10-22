-- CORRECTED Performance Fixes for Supabase
-- This fixes the table name mismatch issue

-- ========================================
-- STEP 1: Check what tables actually exist first
-- ========================================

-- Let's see what tables we actually have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ========================================
-- STEP 2: Add Missing Indexes (only for tables that exist)
-- ========================================

-- Add indexes for chats table (this should exist)
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);

-- Add indexes for documents table (this should exist)
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_chat_id ON public.documents(chat_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

-- Add indexes for profiles table (this should exist)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Only add indexes for uploaded_files if the table exists
-- (We'll check this first with the query above)

-- ========================================
-- STEP 3: Optimize RLS Policies (only for tables that exist)
-- ========================================

-- Drop and recreate RLS policies for chats
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;

CREATE POLICY "Users can view own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate RLS policies for documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Only create policies for uploaded_files if the table exists
-- (We'll check this first)

-- ========================================
-- STEP 4: Update Statistics (only for existing tables)
-- ========================================

ANALYZE public.chats;
ANALYZE public.documents;
ANALYZE public.profiles;

-- Only analyze uploaded_files if it exists

-- ========================================
-- STEP 5: Success Check
-- ========================================

SELECT 'Performance fixes applied successfully for existing tables!' as status;
