import { supabase } from "@/supabase";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { log } from "@/util/logger";

export async function addAccessToMember({
  userId,
  accessId,
  communityId,
}: {
  userId: string;
  accessId: number;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_access")
    .insert({
      user_id: userId,
      community_id: communityId,
      access_level_id: accessId,
    })
    .select()
    .single();
  if (error) {
    log({ error });
  }
  return data;
}

export async function removeAccessFromMember(
  communityAccessId: CommunityAccess["id"]
) {
  const { data, error } = await supabase
    .from("community_access")
    .delete()
    .match({ id: communityAccessId })
    .select()
    .single();
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadCommunityAccessTimes(communityId: string) {
  const { data, error } = await supabase
    .from("access_levels")
    .select()
    .eq("community_id", communityId);
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadUserCommunityAccess({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_access")
    .select()
    .match({ community_id: communityId, user_id: userId });
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadUserCommunityAccessLevels({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_access")
    .select("access_level_id (*)")
    .match({ community_id: communityId, user_id: userId });
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadAllUserAccess({ userId }: { userId: string }) {
  const { data, error } = await supabase
    .from("community_access")
    .select()
    .match({ user_id: userId });
  if (error) {
    log({ error });
  }
  return data;
}
