import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

interface Params {
  message: string;
  responseEmail?: string;
  group: "rsvp only" | "all players" | "creator" | "all";
  gameId: number;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
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

  const params: Params = JSON.parse(event.body);

  const game = await loadGame(params.gameId);
  const fromUser = await loadProfile(user.user.id);
  const creator = await loadProfile(game.creator_id);

  const playerIds = await loadAllPlayersForGame(game.id);
  if (!playerIds.includes(user.user.id) && creator.id !== user.user.id) {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }
  const allIds = playerIds.concat(creator.id);
  const data = await writeMessageToDb({
    from: fromUser.id,
    to: allIds,
    message: params.message,
    topicId: String(game.id),
  });
  const contacts = [];
  // TODO: check profile for notification preference
  // if (params.group === "creator") {
  //   contacts.push({ name: creator.name, email: creator.email });
  // } else if (params.group === "rsvp only") {
  //   const sessions = await loadSessions(params.gameId);
  //   const allRsvpd = sessions.flatMap((session) => {
  //     return session.rsvps.slice(0, session.participant_count);
  //   });
  //   const dedupedRsvps = [...new Set(allRsvpd)];
  //   const profiles = await Promise.all(
  //     dedupedRsvps.map((userId) => loadProfile(userId))
  //   );
  //   contacts.push(
  //     ...profiles.map((profile) => ({
  //       name: profile.username,
  //       email: profile.email,
  //     }))
  //   );
  // }

  const messages = contacts.map((contact) =>
    buildMessage({
      name: contact.name,
      email: contact.email,
      message: params.message,
      gameName: game.title,
      fromName: fromUser.username,
      responseEmail: params.responseEmail,
    })
  );

  // try {
  //   await sendGameMessages({ messages });
  //   console.info("successfully sent messages");
  // } catch (error) {
  //   console.error("unable to send messages", error);
  // }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
      message: data,
    }),
  };
};

async function loadAllPlayersForGame(gameId) {
  const sessions = await loadSessions(gameId);
  const allRsvpd = sessions.flatMap((session) => {
    return session.rsvps;
  });
  const dedupedRsvps = [...new Set(allRsvpd)];
  return dedupedRsvps;
}

async function writeMessageToDb({ from, to, message, topicId }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      from,
      to,
      message,
      topic_type: "game",
      topic_id: topicId,
      record_type: "text",
    })
    .single();
  if (error) {
    console.error({ error });
  }
  if (data) {
    return data;
  }
}

async function loadGame(gameId: number) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (error) {
    console.error({ error });
  }
  if (data) {
    return data;
  }
}

async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error({ error });
  }
  if (data) {
    return data;
  }
}

async function loadSessions(gameId: number) {
  const { data, error } = await supabase
    .from("sessions")
    .select("rsvps, participant_count")
    .eq("game_id", gameId);

  if (error) {
    console.error({ error });
  }
  if (data) {
    return data;
  }
}

function sendGameMessages({ messages }: { messages: unknown[] }) {
  return axios.post(
    "https://api.mailjet.com/v3.1/send",
    {
      Messages: messages,
    },
    {
      auth: {
        username: process.env.MJ_USER,
        password: process.env.MJ_PW,
      },
      timeout: 7000,
    }
  );
}

function buildMessage({
  name,
  email,
  message,
  gameName,
  fromName,
  responseEmail,
}) {
  return {
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
    TemplateID: 3904227,
    TemplateLanguage: true,
    Subject: `New Message on Playabl - ${gameName}`,
    Variables: {
      game_name: gameName,
      from_name: fromName,
      message,
      response_email: responseEmail
        ? `They shared their email: ${responseEmail}`
        : "They did not share their email",
    },
  };
}
