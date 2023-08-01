import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, userIsCommunityAdmin } from "../utils";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event) => {
  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }
  const communityEvent = JSON.parse(event.body);
  const isAdmin = userIsCommunityAdmin({
    userId: user.data.user.id,
    communityId: communityEvent.community_id,
  });
  if (isAdmin) {
    const { data, error } = await supabase
      .from("community_events")
      .insert(communityEvent)
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
  }
};
