import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utlvhpxjykxigudmrpsm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHZocHhqeWt4aWd1ZG1ycHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NDE5MTksImV4cCI6MjA1NDQxNzkxOX0.vP6m3bC5Zk1Wz7v2L5N4M9X8J1K2L3M4N5O6P7Q8R9S'

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)