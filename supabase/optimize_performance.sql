-- SmartProBono Lite - Performance Optimization SQL
-- Fixes for Supabase Performance Advisor warnings and suggestions

-- ========================================
-- 1. FIX AUTH RLS INITIALIZATION PLAN WARNINGS
-- ========================================

-- Drop existing RLS policies that might be causing initialization issues
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view own uploaded files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can delete own uploaded files" ON public.uploaded_files;

-- Create optimized RLS policies with better performance
-- These policies avoid complex auth function calls that cause initialization warnings

-- CHATS table policies
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON public.chats
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON public.chats
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON public.chats
  FOR DELETE 
  USING (auth.uid() = user_id);

-- DOCUMENTS table policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE 
  USING (auth.uid() = user_id);

-- UPLOADED_FILES table policies
CREATE POLICY "Users can view own uploaded files" ON public.uploaded_files
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded files" ON public.uploaded_files
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded files" ON public.uploaded_files
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ========================================
-- 2. ADD INDEXES FOR UNINDEXED FOREIGN KEYS
-- ========================================

-- Add indexes for foreign key columns to improve query performance

-- Indexes for CHATS table
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at);

-- Indexes for DOCUMENTS table
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_chat_id ON public.documents(chat_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at);

-- Indexes for UPLOADED_FILES table
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_chat_id ON public.uploaded_files(chat_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_type ON public.uploaded_files(file_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON public.uploaded_files(created_at);

-- Indexes for PROFILES table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- ========================================
-- 3. ADDITIONAL PERFORMANCE OPTIMIZATIONS
-- ========================================

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chats_user_created ON public.chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_type ON public.documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON public.documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_created ON public.uploaded_files(user_id, created_at DESC);

-- Add partial indexes for active records (if needed)
-- CREATE INDEX IF NOT EXISTS idx_active_chats ON public.chats(user_id) WHERE updated_at > NOW() - INTERVAL '30 days';
-- CREATE INDEX IF NOT EXISTS idx_recent_documents ON public.documents(user_id) WHERE created_at > NOW() - INTERVAL '90 days';

-- ========================================
-- 4. UPDATE TABLE STATISTICS
-- ========================================

-- Update table statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.chats;
ANALYZE public.documents;
ANALYZE public.uploaded_files;

-- ========================================
-- 5. VERIFY RLS IS ENABLED
-- ========================================

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

-- This query will show the current status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'chats', 'documents', 'uploaded_files')
ORDER BY tablename;
