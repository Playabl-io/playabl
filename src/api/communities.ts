import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
import { Community } from "@/typings/Community";

export async function loadJoinedCommunities() {
  if (!store.user) return;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id (*)")
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    return data.map((membership) => ({
      ...membership.community_id,
    }));
  }
}

export async function loadCreatorAndAdminCommunities() {
  if (!store.user) return;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("role_id, user_id, community_id (*)")
    .lt("role_id", 3)
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    return data.map((membership) => membership.community_id);
  }
}

export async function loadJoinedCommunityIds(
  userId: string
): Promise<{ community_id: string }[] | undefined> {
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id")
    .eq("user_id", userId);
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function joinCommunity({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_memberships")
    .insert({
      community_id: communityId,
      user_id: userId,
      role_id: ROLES.player,
    })
    .select()
    .single();
  if (data) {
    return data;
  }
  if (error) {
    throw error;
  }
}

export async function updateCommunity({
  communityId,
  update,
}: {
  communityId: string;
  update: Partial<Community>;
}) {
  const { data, error } = await supabase
    .from("communities")
    .update(update)
    .eq("id", communityId)
    .select()
    .single();
  if (error) {
    throw error;
  }
  if (data) {
    return data;
  }
}

export async function loadCommunityByShortName({
  shortName,
  select,
}: {
  shortName: string;
  select: string;
}) {
  const { data, error, status } = await supabase
    .from("communities")
    .select(select)
    .eq("url_short_name", shortName)
    .single();
  if (error && status !== 406) {
    throw error;
  }
  if (data) {
    return data as Partial<Community>;
  }
}

export async function selectFromCommunity({
  communityId,
  select,
}: {
  communityId: string;
  select: string;
}) {
  const { data, error } = await supabase
    .from("communities")
    .select(select)
    .eq("id", communityId)
    .single();
  if (error) {
    throw error;
  }
  if (data) {
    return data as Partial<Community>;
  }
}

export async function setPublicAccess({
  enabled,
  communityId,
}: {
  enabled: boolean;
  communityId: string;
}) {
  const { error } = await supabase
    .from("communities")
    .update({
      allow_public_signup: enabled,
    })
    .eq("id", communityId)
    .single();
  if (error) {
    throw error;
  }
}

export async function getCommunityMemberCount(id: string) {
  return supabase
    .from("community_memberships")
    .select("*", { count: "estimated" })
    .eq("community_id", id);
}

export async function isShortNameAvailable({
  shortName,
  id,
}: {
  shortName: string;
  id: string;
}) {
  const { error, status } = await supabase
    .from("communities")
    .select("id")
    .eq("url_short_name", shortName)
    .neq("id", id)
    .single();
  if (error && status === 406) {
    return true;
  } else if (error) {
    log({ error });
  }
  return false;
}
