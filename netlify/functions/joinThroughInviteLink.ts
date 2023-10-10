import { ROLES } from "../../src/util/roles";
import { Handler } from "@netlify/functions";
import { logError, supabase } from "../utils";

export const handler: Handler = async (event) => {
  const { inviteId, userId, communityId } = event.queryStringParameters;
  const { data } = await supabase
    .from("community_invites")
    .select("is_revoked")
    .eq("id", inviteId)
    .single();
  if (data?.is_revoked) {
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
  } catch (error) {
    await logError({ message: JSON.stringify(error) });
    return {
      statusCode: 500,
      boday: "Unable to complete request",
    };
  }
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
    .select()
    .single();
  if (data) {
    return data;
  }
  if (error) {
    throw error;
  }
}
