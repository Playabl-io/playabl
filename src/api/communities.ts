import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import { ROLES } from "@/util/roles";

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

export async function loadJoinedCommunityIds(): Promise<
  { community_id: string }[] | undefined
> {
  if (!store.user) return;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id")
    .eq("user_id", store.user.id);
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
    .single();
  if (data) {
    return data;
  }
  if (error) {
    throw error;
  }
}
