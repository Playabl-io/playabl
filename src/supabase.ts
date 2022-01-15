import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
