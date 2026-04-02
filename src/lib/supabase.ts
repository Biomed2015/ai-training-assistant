import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'member'
  created_at: string
}

export type Case = {
  id: string
  title: string
  industry: string | null
  case_type: string | null
  content: string
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  user_id: string
  case_id: string | null
  role: 'user' | 'assistant'
  message: string
  created_at: string
}
