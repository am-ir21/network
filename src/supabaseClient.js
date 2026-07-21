import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utlvhpajykxigudmrpsm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHZocGFqeWt4aWd1ZG1ycHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODQ1NTksImV4cCI6MjA5OTQ2MDU1OX0.tDzsugraIPx2GRxBFwFud7iuDDBdwQcuhfFs7vWUN0U'
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)