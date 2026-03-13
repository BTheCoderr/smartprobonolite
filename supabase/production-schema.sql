-- SmartProBono Lite Production Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CHATS TABLE
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UPLOADS TABLE (for intake files)
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for uploads
CREATE POLICY "Users can view their own uploads" ON uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" ON uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for uploaded files (optional)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('intake-files', 'intake-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'intake-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'intake-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'intake-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
