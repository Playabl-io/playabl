import { Handler } from "@netlify/functions";
import { logError, sendEmail } from "../utils";

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

  try {
    await sendUnreadNotificationEmail({ name: username, email, count });
  } catch (error) {
    logError({
      message: `Failed sending unred notification email in unreadNotificationsEmail: ${error}`,
    });
  }
  return {
    statusCode: 201,
  };
};

function sendUnreadNotificationEmail({ name, email, count }) {
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
    TemplateID: 4366949,
    TemplateLanguage: true,
    Subject: "You have new notifications on Playabl",
    Variables: {
      count,
    },
  });
}
