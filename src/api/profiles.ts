import { supabase } from "@/supabase";
import { Profile } from "@/typings/Profile";
import { log } from "@/util/logger";

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

export async function updateProfile({
  userId,
  update,
}: {
  userId: string;
  update: Partial<Profile>;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .update(update, { returning: "minimal" })
    .eq("id", userId);
  if (error) {
    log(error);
    throw error;
  }
  if (data) return data;
}
