import { Handler } from "@netlify/functions";
import { sendEmail, supabase } from "../utils";
import axios from "axios";
import { format } from "date-fns";

export const handler: Handler = async (event) => {
  const { toEmail, toName, gameName, gameId, sessionTime } =
    event.queryStringParameters;

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

  await sendRemovalEmail({
    name: toName,
    email: toEmail,
    gameName,
    sessionTime: format(new Date(Number(sessionTime)), "EEE, MMM do h:mm a O"),
    relatedUrl: `https://app.playabl.io/games/${gameId}`,
  });

  return {
    statusCode: 200,
  };
};

function sendRemovalEmail({ name, email, relatedUrl, gameName, sessionTime }) {
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
    TemplateID: 4647989,
    TemplateLanguage: true,
    Subject: `You have been removed from a session of ${gameName}`,
    Variables: {
      game_name: gameName,
      related_url: relatedUrl,
      session_time: sessionTime,
    },
  });
}
