import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SupabaseUrl;
const supabaseServiceRole = process.env.SupabaseServiceRole;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error("Supabase not defined");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRole);
