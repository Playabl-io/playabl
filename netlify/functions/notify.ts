import { Handler } from "@netlify/functions";
import axios from "axios";

export const handler: Handler = async (event) => {
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
        name: record.user_name,
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
        name: record.user_name,
        email: record.email,
        gameName: record.custom_fields?.game_name,
      });
      console.info("successfully sent cancel email");
    } catch (error) {
      console.error("failed to send cancel email", error);
    }
  }
  if (record.type === "notify_creator_of_rsvp") {
    if (record.custom_fields?.send_notification_email) {
      try {
        await sendNewJoinEmail({
          name: record.user_name,
          email: record.email,
          message: record.message,
        });
        console.info("successfully sent new join email");
      } catch (error) {
        console.error("failed to send new join email", error);
      }
    }
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
function sendNewJoinEmail({ name, email, message }) {
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
          TemplateID: 4405929,
          TemplateLanguage: true,
          Subject: "New RSVP to your Game - Playabl",
          Variables: {
            message,
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
