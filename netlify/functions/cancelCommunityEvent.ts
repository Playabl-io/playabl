import { Handler } from "@netlify/functions";
import { authenticateUser, userIsCommunityAdmin, supabase } from "../utils";
import { cancelGame } from "../rpc";

export const handler: Handler = async (event) => {
  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }
  const { event_id: eventId } = event.queryStringParameters as {
    event_id: string;
  };
  const { data: current, error: currentError } = await supabase
    .from("community_events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (currentError) {
    console.error(currentError);
    return {
      statusCode: 400,
      body: "No event matching event ID" + eventId,
    };
  }
  const isAdmin = await userIsCommunityAdmin({
    userId: user.data?.user?.id,
    communityId: current.community_id,
  });

  if (!isAdmin) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }

  const now = new Date();

  const { data: eventGames } = await supabase
    .from("games")
    .select("*")
    .is("deleted_at", null)
    .eq("event_id", eventId);

  if (eventGames && eventGames.length > 0) {
    const gameIds = eventGames.map((game) => game.id);
    await Promise.allSettled(gameIds.map(cancelGame));
  }

  const { data, error } = await supabase
    .from("community_events")
    .update({ deleted_at: now })
    .eq("id", current.id)
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(data),
  };
};
