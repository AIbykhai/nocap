import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'https://ciycpzeffwrrngwiguzy.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please check your .env file.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpeWNwemVmZndycm5nd2lndXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTkwMzksImV4cCI6MjA2Njg3NTAzOX0.WjMGuTQ_cNFGGPeRAQxlZHnmlnutQJ2e8677dIFoy6w') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)