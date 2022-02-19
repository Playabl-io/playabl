import { supabase } from "@/supabase";
import { log } from "@/util/logger";

export async function searchCommunityMembers(query: {
  communityId: string;
  searchTerm: string;
  roleId?: number;
  from: number;
  to: number;
}) {
  if (typeof query.roleId === "number") {
    return searchByTermAndRole(query);
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
