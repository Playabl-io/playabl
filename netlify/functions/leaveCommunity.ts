import { Handler } from "@netlify/functions";
import { supabase } from "../utils";
import { cancelGame, leaveSession } from "../rpc";

export const handler: Handler = async (event) => {
  const { token } = event.headers;

  const user = await supabase.auth.getUser(token);

  if (user.data.user.aud !== "authenticated") {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }

  const { communityId, userId: maybeUserId } = event.queryStringParameters;

  const userId = maybeUserId || user.data.user.id;
  if (maybeUserId) {
    // user ID was passed, so check that token is from an admin
    const { data } = await supabase
      .from("community_memberships")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("community_id", communityId)
      .single();
    if (data && data.role_id !== 1) {
      return {
        statusCode: 403,
        boday: JSON.stringify({
          status: "not authorized",
        }),
      };
    }
  }
  // get games they scheduled
  const games = await getUpcomingGames({
    userId,
    communityId,
  });
  await Promise.allSettled(games.map((game) => cancelGame(game.id)));

  // get games they're playing in
  const sessions = await getUpcomingSessions({ userId, communityId });
  await Promise.allSettled(
    sessions.map((session) => leaveSession({ sessionId: session.id, userId })),
  );

  // remove community access
  await removeCommunityAccess({ userId, communityId });

  // remove community role
  await removeCommunityMembership({ userId, communityId });

  return {
    statusCode: 200,
  };
};

async function getUpcomingGames({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const today = new Date();
  const { data } = await supabase
    .from("games")
    .select("*, sessions!inner(*)")
    .eq("community_id", communityId)
    .eq("creator_id", userId)
    .neq("deleted_at", null)
    .gte("sessions.start_time", today.getTime());
  return data || [];
}

export async function getUpcomingSessions({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const today = new Date();
  const { data } = await supabase
    .from("sessions")
    .select("*, games(*)")
    .eq("community_id", communityId)
    .contains("rsvps", [userId])
    .gte("start_time", today.getTime());

  return data || [];
}

export async function removeCommunityMembership({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  return supabase
    .from("community_memberships")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);
}

export async function removeCommunityAccess({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  return supabase
    .from("community_access")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);
}
