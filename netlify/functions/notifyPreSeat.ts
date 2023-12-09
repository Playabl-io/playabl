import { Handler } from "@netlify/functions";
import { addNotificationRecord, authenticateUser, supabase } from "../utils";

export const handler: Handler = async (event) => {
  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }

  const sessions = JSON.parse(event.body);

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", sessions[0].game_id)
    .single();

  if (game.creator_id !== user.data.user.id) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }

  const toNotify = new Set(
    sessions.reduce((users, curSession) => {
      if (curSession?.rsvps?.length > 0) {
        return users.concat(curSession.rsvps);
      }
      return users;
    }, []),
  );

  console.log(toNotify);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [...toNotify]);

  console.log(profiles);

  for (const user of profiles) {
    await addNotificationRecord({
      user_id: user.id,
      user_name: user.username,
      email: user.email,
      message: `You have been pre-seated in the game ${game.title}`,
      related_url: `https://app.playabl.io/games/${game.id}`,
      type: "pre_seated_rsvp",
      custom_fields: {
        game_name: game.title,
      },
    });
  }

  return {
    statusCode: 201,
  };
};
