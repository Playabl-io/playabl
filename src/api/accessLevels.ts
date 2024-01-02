import { supabase } from "@/supabase";
import { AccessLevel, NewAccessLevel } from "@/typings/AccessLevel";
import { log } from "@/util/logger";

export async function getAccessLevels(communityId: string) {
  const { data } = await supabase
    .from("access_levels")
    .select()
    .eq("community_id", communityId);
  return data;
}

export async function createAccessLevel(accessLevel: NewAccessLevel) {
  const { data, error } = await supabase
    .from("access_levels")
    .insert(accessLevel)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccessLevel(accessLevel: AccessLevel) {
  const { data, error } = await supabase
    .from("access_levels")
    .update(accessLevel)
    .match({ id: accessLevel.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccessLevel(accessLevel: AccessLevel) {
  const { data, error } = await supabase
    .from("access_levels")
    .delete()
    .match({ id: accessLevel.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function loadAccessLevels({
  accessLevelIds,
}: {
  accessLevelIds: number[];
}) {
  const { data, error } = await supabase
    .from("access_levels")
    .select("*")
    .in("id", accessLevelIds);

  if (error) {
    log({ error });
  }
  return data;
}
