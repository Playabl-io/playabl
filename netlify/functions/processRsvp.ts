import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { userCanRsvp } from "../../src/util/time";
import { GameSession } from "../../src/typings/Session";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event) => {
  const method = event.httpMethod;
  const { sessionId, userId } = event.queryStringParameters;

  const { token } = event.headers;

  const user = await supabase.auth.api.getUser(token);

  if (user.user.aud !== "authenticated") {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }

  const { session, game } = await getGameAndCommunityInfo({ sessionId });

  if (method === "POST") {
    const canRsvp = confirmRsvpAccess({
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
    const data = await joinSession({ sessionId, userId });
    if (beforeRsvps.length < game.participant_count) {
      const user = await getUserProfile({ userId });
      await sendRsvpEmail({
        gameName: game.title,
        relatedUrl: `https://app.playabl.io/games/${game.id}`,
        email: user.email,
        name: user.username || user.email,
      });
    }
    return {
      statusCode: 201,
      body: JSON.stringify({
        data,
      }),
    };
  }
  if (method === "DELETE") {
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
  return userCanRsvp({
    userAccess,
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

async function joinSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  return supabase.rpc("join_session", {
    user_id: userId,
    session_id: Number(sessionId),
  });
}

async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const { data, error } = await supabase.rpc("leave_session", {
    user_id: userId,
    session_id: Number(sessionId),
  });
  if (error) {
    console.log(error);
  }
  return data;
}

function sendRsvpEmail({ name, email, relatedUrl, gameName }) {
  return axios
    .post(
      "https://api.mailjet.com/v3.1/send",
      {
        Messages: [
          {
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
          },
        ],
      },
      {
        auth: {
          username: process.env.MJ_USER,
          password: process.env.MJ_PW,
        },
      }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
}
