import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:support@playabl.io",
  process.env.VITE_WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event, context) => {
  const { authorization } = event.headers;

  if (authorization !== process.env.WEB_MAIL_PASSWORD) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied",
      }),
    };
  }
  const { record } = JSON.parse(event.body);

  sendEmail({
    message: record.message,
    email: record.email,
    relatedUrl: record.related_url,
  });
  webPush({
    userId: record.user_id,
    message: record.message,
    relatedUrl: record.related_url,
  });
  return {
    statusCode: 200,
  };
};

function sendEmail({ message, email, relatedUrl }) {
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
              Email: email,
            },
          ],
          Subject: `Playabl RSVP Success`,
          TextPart: message,
          HTMLPart: `
            <h3>Get ready to play, you're in!</h3>
            <p>${message}</p>
            <br />
            <p>View on <a href="${relatedUrl}">Playabl</a></p>
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

const webPush = async ({ userId, message, relatedUrl }) => {
  const { data } = await supabase
    .from("profiles")
    .select("subscriptions")
    .eq("id", userId)
    .single();
  if (Array.isArray(data.subscriptions)) {
    data.subscriptions.forEach((subscription) => {
      const decoded = decodeURIComponent(subscription);
      const parsed = JSON.parse(decoded);
      webpush.sendNotification(parsed, message);
    });
  }
};
