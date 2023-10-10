import { Handler } from "@netlify/functions";
import {
  authenticateUser,
  userIsCommunityAdmin,
  supabase,
  logError,
} from "../utils";

export const handler: Handler = async (event) => {
  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }
  const { event_id: eventId } = event.queryStringParameters;
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
    userId: user.data.user.id,
    communityId: current.community_id,
  });
  if (!isAdmin) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }

  const { data, error } = await supabase
    .from("community_events")
    .update({ draft_state: "PUBLISHED" })
    .eq("id", current.id)
    .select()
    .single();

  if (error) {
    await logError({ message: JSON.stringify(error) });
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
