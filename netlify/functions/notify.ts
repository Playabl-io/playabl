import { Handler } from "@netlify/functions";
import {
  buildCommunityAdminMessage,
  logError,
  logInfo,
  sendEmail,
} from "../utils";

/**
 * This function is called any time a record is written to the
 * notifications table. This is where you can respond to the
 * record type and send an email.
 */

export const handler: Handler = async (event) => {
  const { authorization } = event.headers;
  const { record } = JSON.parse(event.body);

  if (authorization !== process.env.WEB_MAIL_PASSWORD) {
    logError({
      message: "Unauthorized connection. Dropping record:" + record.id,
    });
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied",
      }),
    };
  }

  if (record.type === "rsvp") {
    try {
      await sendRsvpEmail({
        name: record.user_name,
        email: record.email,
        relatedUrl: record.related_url,
        gameName: record.custom_fields?.game_name,
      });
      logInfo({ message: "successfully sent rsvp email" });
    } catch (error) {
      logError({
        message: `failed to send rsvp email: ${error}`,
      });
    }
  }
  if (record.type === "pre_seated_rsvp") {
    const adminMessage = sendPreSeatEmail({
      name: record.user_name,
      email: record.email,
      relatedUrl: record.related_url,
      gameName: record.custom_fields?.game_name,
    });
    try {
      await sendEmail(adminMessage);
      logInfo({ message: "successfully sent pre_seated_rsvp email" });
    } catch (error) {
      logError({
        message: `failed to send pre_seated_rsvp email: ${error}`,
      });
    }
  }
  if (record.type === "cancel") {
    try {
      await sendCancelEmail({
        name: record.user_name,
        email: record.email,
        gameName: record.custom_fields?.game_name,
      });
      logInfo({ message: "successfully sent cancel email" });
    } catch (error) {
      logError({
        message: `failed to send cancel email: ${error}`,
      });
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
        logInfo({ message: "successfully sent notify_creator_of_rsvp email" });
      } catch (error) {
        logError({
          message: `failed to send notify_creator_of_rsvp email: ${error}`,
        });
      }
    }
  }
  if (record.type === "membership_request_approval") {
    try {
      await sendMembershipApprovalEmail({
        name: record.user_name,
        email: record.email,
        message: record.message,
        relatedUrl: record.related_url,
      });
      logInfo({ message: "successfully sent membership approval email" });
    } catch (error) {
      logError({
        message: `failed to send membership_request email: ${error}`,
      });
    }
  }
  if (
    record.type === "community_admin_message" &&
    record.custom_fields.send_email
  ) {
    const adminMessage = buildCommunityAdminMessage({
      name: record.user_name,
      email: record.email,
      message: record.message,
      relatedUrl: record.related_url,
      subject: record.custom_fields?.subject,
    });
    try {
      await sendEmail(adminMessage);
      logInfo({ message: "successfully sent community admin email" });
    } catch (error) {
      logError({
        message: `failed to send community_admin email: ${error}`,
      });
    }
  }

  return {
    statusCode: 200,
  };
};

function sendMembershipApprovalEmail({ name, email, relatedUrl, message }) {
  const mailjetMessage = {
    From: {
      Email: "notifications@playabl.io",
      Name: "Playabl",
    },
    To: [
      {
        Email: email,
        Name: name,
      },
    ],
    TemplateID: 4717066,
    TemplateLanguage: true,
    Subject: "Playabl Community Membership Request Approved",
    Variables: {
      message,
      related_url: relatedUrl,
    },
  };
  return sendEmail(mailjetMessage);
}
function sendPreSeatEmail({ name, email, relatedUrl, gameName }) {
  const mailjetMessage = {
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
    TemplateID: 5423059,
    TemplateLanguage: true,
    Subject: `Playabl - You've been pre-seated for ${gameName}!`,
    Variables: {
      game_name: gameName,
      related_url: relatedUrl,
    },
  };
  return sendEmail(mailjetMessage);
}
function sendRsvpEmail({ name, email, relatedUrl, gameName }) {
  const mailjetMessage = {
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
  };
  return sendEmail(mailjetMessage);
}
function sendNewJoinEmail({ name, email, message }) {
  const mailjetMessage = {
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
  };
  return sendEmail(mailjetMessage);
}

function sendCancelEmail({ name, email, gameName }) {
  const mailjetMessage = {
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
  };

  return sendEmail(mailjetMessage);
}
