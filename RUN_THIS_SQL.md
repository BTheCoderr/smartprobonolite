# 🗄️ Run This SQL in Supabase

## ✅ Your Keys Are Configured!

Now we need to set up the database tables.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard**
2. Click on your **`smartprobono-lite`** project
3. In the left sidebar, click **📊 SQL Editor**
4. Click **"+ New query"** button (top right)

### Step 2: Copy the SQL Schema

**Option A: Copy from File**
1. In Cursor/VS Code, open this file: `supabase/production-schema.sql`
2. Press **Cmd+A** (Mac) or **Ctrl+A** (Windows) to select all
3. Press **Cmd+C** / **Ctrl+C** to copy

**Option B: I'll paste it below for you!**

### Step 3: Paste and Run

1. Back in Supabase SQL Editor
2. **Paste** the SQL (Cmd+V / Ctrl+V)
3. Click **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
4. Wait a few seconds...
5. You should see: ✅ **"Success. No rows returned"**

### Step 4: Verify Tables Were Created

1. In Supabase sidebar, click **🗄️ Table Editor**
2. You should now see these tables:
   - ✅ `chats`
   - ✅ `documents`
   - ✅ `uploads`

---

## 📝 The SQL Schema (Copy This!)

```sql
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
```

---

## ✅ After Running the SQL

Once you see "Success", come back here and we'll:

1. ✅ Restart your dev server
2. ✅ Test the login functionality
3. ✅ Verify chat history saves
4. ✅ Test document generation

---

## 🐛 Troubleshooting

### If you see an error about policies already existing:
- That's OK! It means some parts were already created
- The important thing is that the tables are there

### If you see "permission denied":
- Make sure you're in the SQL Editor (not the Table Editor)
- Make sure you're logged into the correct project

### Can't find SQL Editor?
- Look for the 📊 icon in the left sidebar
- Or look for "SQL Editor" text

---

## 🎯 Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Selected my `smartprobono-lite` project
- [ ] Clicked SQL Editor
- [ ] Clicked "New query"
- [ ] Copied the SQL above
- [ ] Pasted into editor
- [ ] Clicked "Run"
- [ ] Saw "Success" message
- [ ] Verified tables in Table Editor

---

**Once you've run this SQL, tell me and I'll restart your server!** 🚀

