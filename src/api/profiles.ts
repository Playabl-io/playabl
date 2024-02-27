import { supabase } from "@/supabase";
import { Profile } from "@/typings/Profile";
import { log } from "@/util/logger";
import { v4 as uuidv4 } from "uuid";

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
    .update(update)
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    log(error);
    throw error;
  }
  if (data) return data;
}

export async function createWebCalForUser(userId: string) {
  const uuid = uuidv4();
  const { data, error } = await supabase
    .from("user_calendars")
    .insert({ user_id: userId, webcal_id: uuid })
    .select()
    .single();
  if (error) {
    log(error);
    throw error;
  }
  if (data) return data;
}

export async function deleteWebCalForUser(webcalId: string) {
  const { error } = await supabase
    .from("user_calendars")
    .delete()
    .eq("webcal_id", webcalId);
  if (error) {
    log(error);
    throw error;
  }
}

export async function loadWebCalForUser(userId: string) {
  const { data, error } = await supabase
    .from("user_calendars")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    log(error);
  }
  if (data) return data;
}
