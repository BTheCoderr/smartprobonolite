import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (with service role key)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  firm_name?: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

export type Chat = {
  id: string;
  user_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  chat_id?: string;
  title: string;
  content: string;
  document_type: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  id: string;
  user_id: string;
  chat_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_text?: string;
  created_at: string;
};

