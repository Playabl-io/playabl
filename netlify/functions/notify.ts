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

  if (record.type === "rsvp") {
    try {
      await sendRsvpEmail({
        name: record.name,
        email: record.email,
        relatedUrl: record.related_url,
        gameName: record.custom_fields?.game_name,
      });
      console.info("successfully sent rsvp email");
    } catch (error) {
      console.error("failed to send rsvp email", error);
    }
  }
  if (record.type === "cancel") {
    try {
      await sendCancelEmail({
        name: record.name,
        email: record.email,
        gameName: record.custom_fields?.game_name,
      });
      console.info("successfully sent cancel email");
    } catch (error) {
      console.error("failed to send cancel email", error);
    }
  }
  try {
    await webPush({
      userId: record.user_id,
      message: record.message,
    });
  } catch (error) {
    console.error("error sending web push", error);
  }
  return {
    statusCode: 200,
  };
};

function sendRsvpEmail({ name, email, relatedUrl, gameName }) {
  return axios.post(
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
      timeout: 7000,
    }
  );
}

function sendCancelEmail({ name, email, gameName }) {
  return axios.post(
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
          TemplateID: 3807927,
          TemplateLanguage: true,
          Variables: {
            game_name: gameName,
          },
        },
      ],
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

const webPush = async ({ userId, message }) => {
  const { data } = await supabase
    .from("profiles")
    .select("subscriptions")
    .eq("id", userId)
    .single();
  if (Array.isArray(data?.subscriptions)) {
    data.subscriptions.forEach((subscription) => {
      const decoded = decodeURIComponent(subscription);
      const parsed = JSON.parse(decoded);
      webpush.sendNotification(parsed, message);
    });
  }
};
