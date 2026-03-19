const SUPABASE_URL = "https://cfvzoabozkllneeepvzc.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnpvYWJvemtsbG5lZWVwdnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODE3MjMsImV4cCI6MjA4ODY1NzcyM30.yEsn8ITMPRwu3DPLlYsY1PBvQudJIpK01u28HTCBVM4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);