import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
import { Community } from "@/typings/Community";
import axios from "axios";

export async function loadCreatorAndAdminCommunities() {
  if (!store.user) return;

  return Object.values(store.userCommunityMembership)
    .filter((membership) => {
      return membership.communityMembership.role_id < 3;
    })
    .map((entry) => entry.community);
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

export async function setSignupMethod({
  signupMethod,
  communityId,
}: {
  signupMethod: Community["signup_method"];
  communityId: Community["id"];
}) {
  const { error } = await supabase
    .from("communities")
    .update({
      signup_method: signupMethod,
    })
    .eq("id", communityId);
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

export async function leaveCommunity(communityId: string, userId = "") {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;
  await axios
    .post(
      `/.netlify/functions/leaveCommunity?communityId=${communityId}&userId=${userId}`,
      {},
      {
        headers: {
          token: session.access_token,
        },
      }
    )
    .catch((error) => {
      log({ error });
      throw error;
    });
}
