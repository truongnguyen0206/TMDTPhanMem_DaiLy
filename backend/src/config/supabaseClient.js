import { createClient } from '@supabase/supabase-js'


export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Nếu bạn muốn dùng service role key (server-side)
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  

// Dán URL và API key từ Supabase project
const SUPABASE_URL = 'https://dnynupuvcbwybpowkvek.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueW51cHV2Y2J3eWJwb3drdmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Mzc4NjMsImV4cCI6MjA3NjIxMzg2M30.fyFQsRgn6ne45V1adL0FbvZOwdaYyQpT01RZgXTZ-Zg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
