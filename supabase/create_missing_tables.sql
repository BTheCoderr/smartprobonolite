-- Create Missing Tables and Fix Performance Issues
-- This will create the uploaded_files table if it doesn't exist

-- ========================================
-- STEP 1: Check what tables exist
-- ========================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ========================================
-- STEP 2: Create uploaded_files table if it doesn't exist
-- ========================================

CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on uploaded_files table
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Add indexes for all tables
-- ========================================

-- Indexes for chats table
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_chat_id ON public.documents(chat_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

-- Indexes for uploaded_files table
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_chat_id ON public.uploaded_files(chat_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON public.uploaded_files(created_at);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ========================================
-- STEP 4: Create RLS policies for uploaded_files
-- ========================================

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
-- STEP 5: Update all table statistics
-- ========================================

ANALYZE public.profiles;
ANALYZE public.chats;
ANALYZE public.documents;
ANALYZE public.uploaded_files;

-- ========================================
-- STEP 6: Final verification
-- ========================================

-- Check that all tables exist and have proper indexes
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'chats', 'documents', 'uploaded_files')
ORDER BY tablename;

SELECT 'All tables created and optimized successfully!' as status;
