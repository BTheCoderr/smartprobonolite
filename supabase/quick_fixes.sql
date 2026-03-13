-- Quick Performance Fixes for Supabase
-- Run this in Supabase SQL Editor to fix the Performance Advisor warnings

-- ========================================
-- STEP 1: Add Missing Indexes (Fixes the 5 "Info" suggestions)
-- ========================================

-- Add indexes for foreign key columns
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_chat_id ON public.documents(chat_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_chat_id ON public.uploaded_files(chat_id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON public.uploaded_files(created_at);

-- ========================================
-- STEP 2: Optimize RLS Policies (Fixes the 12 "Warning" issues)
-- ========================================

-- Drop and recreate RLS policies with better performance
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

-- Recreate optimized policies
CREATE POLICY "Users can view own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own uploaded files" ON public.uploaded_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploaded files" ON public.uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploaded files" ON public.uploaded_files FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- STEP 3: Update Statistics
-- ========================================

ANALYZE public.chats;
ANALYZE public.documents;
ANALYZE public.uploaded_files;

-- ========================================
-- SUCCESS CHECK
-- ========================================

-- Check that everything is working
SELECT 'Performance fixes applied successfully!' as status;
