// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://azmrpbfifkznhqbyftsg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bXJwYmZpZmt6bmhxYnlmdHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTkxODgsImV4cCI6MjA3MDczNTE4OH0.QUVT27UGijBsWHMxE8Fgfg0MPSVdFRWcqMRqjz3GTaQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
