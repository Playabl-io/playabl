import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ADMIN } from "@/util/roles";

export async function loadUserCommunityMembership({
  communityId,
  userId,
}: {
  communityId: string;
  userId: string;
}) {
  const { data, error, status } = await supabase
    .from("community_memberships")
    .select("*")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();
  if (error && status !== 406) {
    log({ error });
    throw error;
  }
  return data;
}

export async function loadCommunityAdmins(communityId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, community_memberships!inner(community_id, role_id)")
    .eq("community_memberships.community_id", communityId)
    .eq("community_memberships.role_id", ADMIN);

  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function searchCommunityMembers(query: {
  communityId: string;
  searchTerm: string;
  roleIds: number[];
  accessIds: number[];
  from: number;
  to: number;
}) {
  const { data, error, count } = await supabase
    .from("profiles")
    .select(
      "*, community_memberships!inner(id, community_id, role_id), community_access!inner(id, user_id, access_level_id)",
      {
        count: "estimated",
      }
    )
    .eq("community_memberships.community_id", query.communityId)
    .in("community_memberships.role_id", query.roleIds)
    .in("community_access.access_level_id", query.accessIds)
    .or(
      `username.ilike.%${query.searchTerm}%,email.ilike.%${query.searchTerm}%`
    )
    .order("username", { ascending: true })
    .range(query.from, query.to);
  if (error) {
    log({ error });
    throw error;
  }
  return { data, count };
}
