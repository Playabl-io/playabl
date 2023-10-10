import { Handler } from "@netlify/functions";
import { logError, sendEmail, supabase } from "../utils";
import { joinSession, leaveSession } from "../rpc";
import { userCanRsvp } from "../../src/util/time";
import { GameSession } from "../../src/typings/Session";
export const handler: Handler = async (event) => {
  const method = event.httpMethod;
  const { sessionId, userId } = event.queryStringParameters;

  const { token } = event.headers;

  const user = await supabase.auth.getUser(token);

  if (user.data?.user?.aud !== "authenticated") {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }

  const { session, game } = await getGameAndCommunityInfo({ sessionId });

  if (method === "POST") {
    const canRsvp = await confirmRsvpAccess({
      session,
      userId,
      communityId: game.community_id,
    });

    if (!canRsvp) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Not eligible to rsvp",
        }),
      };
    }
    const beforeRsvps = session.rsvps;
    const { error, status } = await joinSession({ sessionId, userId });
    if (error) {
      return {
        statusCode: status,
        body: JSON.stringify({
          error,
        }),
      };
    }
    const user = await getUserProfile({ userId });
    try {
      await notifyGameCreator({
        creatorId: game.creator_id,
        joiningUserName: user.username,
        gameId: game.id,
        gameName: game.title,
      });
    } catch (error) {
      error.message =
        error.message || "Failed to send notification to game creator";
      await logError({ message: JSON.stringify(error) });
    }
    if (beforeRsvps.length < game.participant_count) {
      await sendRsvpEmail({
        gameName: game.title,
        relatedUrl: `https://app.playabl.io/games/${game.id}`,
        email: user.email,
        name: user.username || user.email,
      });
    }
    return {
      statusCode: 201,
    };
  }
  if (method === "DELETE") {
    if (user.data.user.id !== userId && user.data.user.id !== game.creator_id) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Unnauthorized",
        }),
      };
    }
    const data = await leaveSession({ sessionId, userId });
    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    };
  }

  return {
    statusCode: 403,
  };
};

async function confirmRsvpAccess({
  userId,
  communityId,
  session,
}: {
  userId: string;
  communityId: string;
  session: GameSession;
}) {
  const userAccess = await loadUserCommunityAccess({
    communityId,
    userId,
  });
  const { data } = await supabase
    .from("community_memberships")
    .select("role_id")
    .eq("community_id", session.community_id)
    .eq("user_id", userId)
    .single();
  if (!data || data.role_id < 1) {
    return false;
  }
  return userCanRsvp({
    userAccess: userAccess ?? [],
    session,
    hostId: session.creator_id,
    userId,
  });
}

async function loadUserCommunityAccess({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data } = await supabase
    .from("community_access")
    .select()
    .match({ community_id: communityId, user_id: userId });
  return data;
}

async function getGameAndCommunityInfo({ sessionId }) {
  const { data } = await supabase
    .from("sessions")
    .select("*, game_id (*)")
    .eq("id", sessionId)
    .single();
  return {
    session: data,
    game: data.game_id,
  };
}

async function getUserProfile({ userId }) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

function sendRsvpEmail({ name, email, relatedUrl, gameName }) {
  return sendEmail({
    From: {
      Email: "notifications@playabl.io",
      Name: "Playabl Notifications",
    },
    To: [
      {
        Email: email,
        Name: name,
      },
    ],
    TemplateID: 3700697,
    TemplateLanguage: true,
    Subject: "Playabl RSVP Success",
    Variables: {
      game_name: gameName,
      related_url: relatedUrl,
    },
  });
}

async function notifyGameCreator({
  creatorId,
  joiningUserName,
  gameId,
  gameName,
}) {
  const user = await getUserProfile({ userId: creatorId });
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      user_name: user.username,
      email: user.email,
      message: `${joiningUserName} joined your game, ${gameName}!`,
      related_url: `https://app.playabl.io/games/${gameId}`,
      type: "notify_creator_of_rsvp",
      read: false,
      custom_fields: {
        send_notification_email: user.email_preferences.rsvp_to_my_game_enabled,
      },
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
}
