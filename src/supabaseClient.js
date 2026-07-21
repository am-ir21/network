import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bwfuldyqtdpyxlvizhvx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZnVsZHlxdGRweXhsdml6aHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzM4OTYsImV4cCI6MjA5OTUwOTg5Nn0.9qVp2ZiDwS8cA_QDEwMjrMgx3mxxoxNTwobPXlCuAJY'
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)