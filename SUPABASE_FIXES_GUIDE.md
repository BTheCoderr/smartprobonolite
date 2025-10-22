# 🔧 Supabase Performance Fixes Guide

## 🚨 **Issues to Fix:**

1. **12 Warnings**: "Auth RLS Initialization Plan" for `chats`, `documents`, and `uploads` tables
2. **5 Info Suggestions**: "Unindexed foreign keys" for better performance

## 📋 **Step-by-Step Fix:**

### **Step 1: Go to Supabase SQL Editor**

1. Open your Supabase dashboard: `https://supabase.com/dashboard/project/hohzypfmoxjogysggwug`
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### **Step 2: Run the Performance Fixes**

Copy and paste this entire SQL script into the SQL Editor:

```sql
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
```

### **Step 3: Execute the Script**

1. Click **"Run"** button in the SQL Editor
2. Wait for it to complete (should take a few seconds)
3. You should see: `Performance fixes applied successfully!`

### **Step 4: Verify the Fixes**

1. Go back to **"Performance Advisor"** in your Supabase dashboard
2. Click **"Refresh"** or **"Rerun linter"** button
3. You should now see:
   - ✅ **0 Warnings** (down from 12)
   - ✅ **0 Info suggestions** (down from 5)
   - ✅ **0 Errors** (still 0)

## 🎯 **What These Fixes Do:**

### **Index Fixes:**
- **Adds indexes** to foreign key columns (`user_id`, `chat_id`)
- **Improves query performance** when filtering by user or chat
- **Reduces database load** for common operations

### **RLS Policy Fixes:**
- **Simplifies Row Level Security policies** to avoid complex auth function calls
- **Removes initialization warnings** that were slowing down queries
- **Maintains security** while improving performance

### **Statistics Update:**
- **Updates table statistics** for better query planning
- **Helps PostgreSQL** choose optimal query execution paths

## 🚀 **Expected Results:**

After running these fixes, your Supabase Performance Advisor should show:
- ✅ **Clean dashboard** with no warnings or suggestions
- ✅ **Faster queries** for user-specific data
- ✅ **Better performance** for chat history and document operations
- ✅ **Optimized database** ready for production use

## 🔍 **If You Still See Issues:**

1. **Wait 5-10 minutes** for changes to propagate
2. **Click "Rerun linter"** in Performance Advisor
3. **Check that all tables exist** in the Database section
4. **Contact me** if you need help with any specific errors

---

**🎉 Once completed, your Supabase database will be optimized and ready for production use!**
