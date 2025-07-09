import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please check your .env file.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)