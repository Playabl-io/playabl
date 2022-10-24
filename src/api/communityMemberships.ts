import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ADMIN, ROLES } from "@/util/roles";

export async function loadUserCommunityMembership({
  communityId,
  userId,
}: {
  communityId: string;
  userId: string;
}) {
  const { data, error, status } = await supabase
    .from("community_memberships")
    .select(`user_id, role_id`)
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();
  if (error && status !== 406) {
    log({ error });
    throw error;
  }
  return data || {};
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

export async function userIsCommunityAdmin({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data } = await supabase
    .from("community_memberships")
    .select("*")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .eq("role_id", ROLES.admin)
    .single();
  if (data) {
    return true;
  }
  return false;
}

export async function searchCommunityMembers(query: {
  communityId: string;
  searchTerm: string;
  roleId?: number;
  from: number;
  to: number;
}) {
  const roleId = query.roleId;
  if (roleId) {
    return searchByTermAndRole({ ...query, roleId });
  }
  return searchByTermAlone(query);
}

async function searchByTermAndRole({
  communityId,
  searchTerm,
  roleId,
  from,
  to,
}: {
  communityId: string;
  searchTerm: string;
  roleId: number;
  from: number;
  to: number;
}) {
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*, community_memberships!inner(id, community_id, role_id)", {
      count: "estimated",
    })
    .eq("community_memberships.community_id", communityId)
    .eq("community_memberships.role_id", roleId)
    .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order("username", { ascending: true })
    .range(from, to);
  if (error) {
    log({ error });
    throw error;
  }
  return { data, count };
}

async function searchByTermAlone({
  communityId,
  searchTerm,
  from,
  to,
}: {
  communityId: string;
  searchTerm: string;
  from: number;
  to: number;
}) {
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*, community_memberships!inner(id, community_id, role_id)", {
      count: "estimated",
    })
    .eq("community_memberships.community_id", communityId)
    .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order("username", { ascending: true })
    .range(from, to);
  if (error) {
    log({ error });
    throw error;
  }
  return { data, count };
}
