import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side operations
 * Uses the anon key for now, but can be updated to use service role key
 * Should only be used in server-side code (remote functions, hooks, etc.)
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
