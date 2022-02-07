import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { format } from "date-fns";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event, context) => {
  const method = event.httpMethod;
  const { sessionId, userId } = event.queryStringParameters;

  const { session, game } = await getGameAndCommunityInfo({ sessionId });

  const userIsCommunityMember = await verifyUserCanJoinSession({
    userId,
    communityId: game.community_id,
  });

  if (userIsCommunityMember) {
    const beforeRsvps = await getRsvps({ sessionId });
    if (method === "POST") {
      const data = await joinSession({ sessionId, userId });
      if (beforeRsvps.length < game.participant_count) {
        sendNewRsvpEmail({
          gameName: game.title,
          sessionStartTime: session.start_time,
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
      const rsvpIndex = beforeRsvps.findIndex(
        (rsvp) => rsvp.user_id === userId
      );
      const data = await leaveSession({ sessionId, userId });

      if (rsvpIndex > -1 && rsvpIndex < game.participant_count) {
        const newRsvps = await getRsvps({ sessionId });

        if (newRsvps.length !== 0) {
          const newlyAdded = newRsvps[game.participant_count - 1];
          const user = await getUserProfile({ userId: newlyAdded.user_id });
          sendNewRsvpEmail({
            gameName: game.title,
            sessionStartTime: session.start_time,
            toEmail: user.email,
            toName: user.username,
          });
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          data,
        }),
      };
    }
  }

  return {
    statusCode: 403,
  };
};

async function getGameAndCommunityInfo({ sessionId }) {
  const { data } = await supabase
    .from("sessions")
    .select("start_time, game_id (*)")
    .eq("id", sessionId)
    .single();
  return {
    session: data,
    game: data.game_id,
  };
}

async function getRsvps({ sessionId }) {
  const { data } = await supabase
    .from("rsvps")
    .select("*")
    .eq("session_id", sessionId);
  return data;
}

async function getUserProfile({ userId }) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

async function verifyUserCanJoinSession({ userId, communityId }) {
  const { data: membershipData } = await supabase
    .from("community_memberships")
    .select()
    .match({ community_id: communityId, user_id: userId })
    .single();
  if (membershipData) {
    return true;
  }
  return false;
}

async function joinSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      session_id: sessionId,
      user_id: userId,
    })
    .single();

  return data;
}

async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("rsvps")
    .delete()
    .match({
      session_id: sessionId,
      user_id: userId,
    })
    .single();

  return data;
}

function sendNewRsvpEmail({
  gameName,
  sessionStartTime,
  toEmail = "jonjongrim@gmail.com",
  toName = "Jonathan Grim",
}) {
  const formattedStartTime = format(sessionStartTime, "EEEE, MMMM do, HH:mm");
  axios.post(
    "https://api.mailjet.com/v3.1/send",
    {
      Messages: [
        {
          From: {
            Email: "jonjongrim@gmail.com",
            Name: "Jonathan",
          },
          To: [
            {
              Email: toEmail,
              Name: toName,
            },
          ],
          Subject: `RSVP Success - ${gameName}`,
          TextPart: `You're RSVP'd to <b>${gameName}</b> on <b>${formattedStartTime}</b> GMT.</p>`,
          HTMLPart: `
            <h3>Get ready to play, you're in!</h3>
            <br />
            <p>You're RSVP'd to <b>${gameName}</b> on <b>${formattedStartTime}</b> GMT.</p>
            `,
          CustomID: "AppGettingStartedTest",
        },
      ],
    },
    {
      auth: {
        username: process.env.MJ_USER,
        password: process.env.MJ_PW,
      },
    }
  );
}
