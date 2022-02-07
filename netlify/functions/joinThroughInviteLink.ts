import { ROLES } from "../../src/util/roles";
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event, context) => {
  const { inviteId, userId, communityId } = event.queryStringParameters;
  const { data } = await supabase
    .from("community_invites")
    .select("is_revoked")
    .eq("id", inviteId)
    .single();
  if (data.is_revoked) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Invalid invite code",
      }),
    };
  }
  try {
    const response = await joinCommunity({ userId, communityId });
    return {
      statusCode: 201,
      body: JSON.stringify({
        data: response,
      }),
    };
  } catch (error) {}
};

async function joinCommunity({
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
