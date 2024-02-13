import * as ics from "ics";
import { format } from "date-fns";
import { Handler } from "@netlify/functions";
import { authenticateUser, logError, sendEmail, supabase } from "../utils";
import { joinSession, leaveSession } from "../rpc";
import { userCanRsvp } from "../../src/util/time";
import { GameSession } from "../../src/typings/Session";

export const handler: Handler = async (event) => {
  const method = event.httpMethod;
  const { sessionId, userId, skipNotifyCreator } = event.queryStringParameters;

  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
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
    if (!skipNotifyCreator) {
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
    }
    if (beforeRsvps.length < game.participant_count) {
      const calItem = createCalendarAttachment({
        startTime: session.start_time,
        endTime: session.end_time,
        title: game.title,
        gameId: game.id,
      });
      try {
        await sendRsvpEmail({
          gameName: game.title,
          relatedUrl: `https://app.playabl.io/games/${game.id}`,
          email: user.email,
          name: user.username || user.email,
          calItem,
        });
      } catch (error) {
        logError({
          message: `Failed sending rsvp email in processRsvp: ${error}`,
        });
      }
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

function sendRsvpEmail({
  name,
  email,
  relatedUrl,
  gameName,
  calItem,
}: {
  name: string;
  email: string;
  relatedUrl: string;
  gameName: string;
  calItem?: string;
}) {
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
    ...(calItem && {
      Attachments: [
        {
          ContentType: "text/plain",
          Filename: "calendar_invite.ics",
          Base64Content: calItem,
        },
      ],
    }),
  });
}

function createCalendarAttachment({
  startTime,
  endTime,
  title,
  gameId,
}: {
  startTime: number;
  endTime: number;
  title: string;
  gameId: number | string;
}) {
  const { value } = ics.createEvent({
    start: format(startTime, "yyyy-M-d-H-m")
      .split("-")
      .map((val) => parseInt(val)) as [number, number, number, number, number],
    end: format(endTime, "yyyy-M-d-H-m")
      .split("-")
      .map((val) => parseInt(val)) as [number, number, number, number, number],
    title: `Playabl RSVP - ${title}`,
    url: `https://app.playabl.io/games/${gameId}`,
    busyStatus: "BUSY",
    description: `You've successfully RSVP'd for ${title}. For full details, please visit the Playabl game page and check with your game facilitator, and don't forget to update your RSVP if you can no longer make it. Game URL - https://app.playabl.io/games/${gameId}`,
  });
  if (value) {
    return btoa(value);
  }
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
