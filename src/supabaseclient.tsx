import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://azmrpbfifkznhqbyftsg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bXJwYmZpZmt6bmhxYnlmdHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTkxODgsImV4cCI6MjA3MDczNTE4OH0.QUVT27UGijBsWHMxE8Fgfg0MPSVdFRWcqMRqjz3GTaQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);