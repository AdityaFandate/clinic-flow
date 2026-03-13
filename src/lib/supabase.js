import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
// It's recommended to use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
