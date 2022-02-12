import { supabase } from "@/supabase";

export async function loadProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (data) {
    return data;
  }
}
