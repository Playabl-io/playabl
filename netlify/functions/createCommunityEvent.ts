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
  const communityEvent = JSON.parse(event.body ?? "");
  const isAdmin = await userIsCommunityAdmin({
    userId: user.data?.user?.id ?? "",
    communityId: communityEvent.community_id,
  });
  if (isAdmin) {
    const { data, error } = await supabase
      .from("community_events")
      .insert(communityEvent)
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
  } else {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }
};
