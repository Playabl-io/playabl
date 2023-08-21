import { supabase } from "@/supabase";
import { Community } from "@/typings/Community";
import { log } from "@/util/logger";
import { ADMIN, ROLES } from "@/util/roles";
import axios from "axios";
import * as R from "ramda";

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

export async function loadUserCommunities({ userId }: { userId: string }) {
  const { data, error } = await supabase
    .from("community_memberships")
    .select("*, community_id (*)")
    .eq("user_id", userId);
  if (error) {
    log({ error });
  }
  if (data) {
    return data.map((membership) => ({
      communityId: membership.community_id.id,
      communityMembership: R.omit(["community_id"], membership),
      community: membership.community_id,
    }));
  }
  return [];
}

export async function loadUserManagedCommunities({
  userId,
}: {
  userId: string;
}) {
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id (*)")
    .eq("user_id", userId)
    .eq("role_id", ADMIN);
  if (error) {
    log({ error });
  }
  if (data) {
    return data.map((membership) => ({
      ...membership.community_id,
    })) as Community[];
  }
  return [];
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

export async function searchInCommunityMembers(query: {
  communityId: string;
  searchTerm: string;
  roleIds: number[];
  from: number;
  to: number;
}) {
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*, community_memberships!inner(id, community_id, role_id)", {
      count: "estimated",
    })
    .eq("community_memberships.community_id", query.communityId)
    .in("community_memberships.role_id", query.roleIds)
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

export async function searchCommunityMembers(query: {
  communityId: string;
  searchTerm: string;
  roleIds: number[];
  accessIds?: number[];
  from: number;
  to: number;
}) {
  if (!query.accessIds) {
    return searchInCommunityMembers(query);
  }
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

export async function submitCommunityMembershipRequest({
  userId,
  message,
  communityId,
  communityName,
}: {
  userId: string;
  message?: string;
  communityId: string;
  communityName: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  const { data, error } = await supabase
    .from("community_membership_requests")
    .insert({
      user_id: userId,
      message,
      community_id: communityId,
    })
    .select()
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  try {
    await axios({
      url: `/.netlify/functions/sendMessageToCommunity`,
      method: "POST",
      headers: {
        token: session.access_token,
      },
      data: {
        message: `A user has requested to join ${communityName}. Review membership requests from the 'Manage' section of the community.`,
        subject: `There is a new request to join ${communityName}`,
        relatedUrl: `${
          import.meta.env.VITE_PLAYABL_URL
        }/communities/${communityId}/manage/members`,
        communityId,
      },
    });
  } catch (error) {
    log({ error });
  }
  return data;
}

export async function loadCommunityRequests({
  communityId,
}: {
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_membership_requests")
    .select("*")
    .eq("community_id", communityId);
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function loadUserCommunityRequests({
  userId,
}: {
  userId: string;
}) {
  const { data, error } = await supabase
    .from("community_membership_requests")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function checkForCommunityRequest({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_membership_requests")
    .select("*")
    .eq("user_id", userId)
    .eq("community_id", communityId)
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function processMembershipRequest({
  requestId,
  userId,
  communityId,
  role,
  action,
}: {
  requestId: number;
  userId: string;
  communityId: string;
  role: ROLES;
  action: "approve" | "deny";
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;
  const data = await axios.post(
    `/.netlify/functions/processMembershipRequest?communityId=${communityId}&userId=${userId}&role=${role}&requestId=${requestId}&action=${action}`,
    {},
    {
      headers: {
        token: session.access_token,
      },
    }
  );

  return data;
}
