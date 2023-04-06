import { ROLES } from "../../src/util/roles";
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event) => {
  const {
    userId,
    communityId,
    role = ROLES.player,
    requestId,
    action,
  } = event.queryStringParameters;

  if (!userId || !communityId || !requestId || !action) {
    return {
      statusCode: 400,
    };
  }

  const { token } = event.headers;

  const submittingUser = await supabase.auth.getUser(token);

  if (submittingUser.data.user.aud !== "authenticated") {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }

  if (action === "deny") {
    await deleteRequest(Number(requestId));
    return {
      statusCode: 201,
    };
  }

  // confirm submitting user is Admin of community
  const { data } = await supabase
    .from("community_memberships")
    .select("role_id")
    .eq("user_id", submittingUser.data.user.id)
    .eq("community_id", communityId)
    .single();
  if (data.role_id !== 1) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "not authorized",
      }),
    };
  }

  try {
    const user = await loadProfile(userId);
    const community = await loadCommunity(communityId);
    const response = await joinCommunity({ userId, communityId, role });
    await notifyMember({
      user_id: user.id,
      email: user.email,
      user_name: user.username,
      message: `Your request to join ${community.name} has been approved and you are now a member!`,
      related_url: `https://app.playabl.io/communities/${
        community.url_short_name || community.id
      }`,
      read: false,
      type: "membership_request_approval",
    });
    await deleteRequest(Number(requestId));
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
    };
  }
};

async function joinCommunity({
  userId,
  communityId,
  role,
}: {
  userId: string;
  communityId: string;
  role: string | number;
}) {
  const { data, error } = await supabase
    .from("community_memberships")
    .insert({
      community_id: communityId,
      user_id: userId,
      role_id: role,
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

async function deleteRequest(requestId: number) {
  const { error } = await supabase
    .from("community_membership_requests")
    .delete()
    .eq("id", requestId);
  if (error) {
    throw error;
  }
}

async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    throw error;
  }
  if (data) {
    return data;
  }
}

async function loadCommunity(communityId: string) {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();
  if (error) {
    throw error;
  }
  if (data) {
    return data;
  }
}

async function notifyMember(notification) {
  const { error } = await supabase.from("notifications").insert(notification);
  if (error) {
    throw error;
  }
}
