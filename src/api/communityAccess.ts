import { supabase } from "@/supabase";
import { log } from "@/util/logger";

export async function addAccessToMember({
  userId,
  accessId,
  communityId,
}: {
  userId: string;
  accessId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_access")
    .insert({
      user_id: userId,
      community_id: communityId,
      access_level_id: accessId,
    })
    .single();
  if (error) {
    log({ error });
  }
  return data;
}

export async function removeAccessFromMember(communityAccessId: string) {
  const { data, error } = await supabase
    .from("community_access")
    .delete()
    .match({ id: communityAccessId })
    .single();
  if (error) {
    log({ error });
  }
  return data;
}
