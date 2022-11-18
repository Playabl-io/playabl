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

  const { username, email, count } = JSON.parse(event.body);

  await sendUnreadNotificationEmail({ name: username, email, count });
  return {
    statusCode: 201,
  };
};

function sendUnreadNotificationEmail({ name, email, count }) {
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
          TemplateID: 4366949,
          TemplateLanguage: true,
          Subject: "You have new notifications on Playabl",
          Variables: {
            count,
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
