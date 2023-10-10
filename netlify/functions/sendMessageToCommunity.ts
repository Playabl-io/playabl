import { Handler } from "@netlify/functions";
import {
  addNotificationRecord,
  buildCommunityAdminMessage,
  loadCommunitySupportEmails,
  sendEmail,
  supabase,
} from "../utils";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const { token } = event.headers;

  const user = await supabase.auth.getUser(token);

  if (user.data.user.aud !== "authenticated") {
    return {
      statusCode: 403,
      boday: JSON.stringify({
        status: "not authorized",
      }),
    };
  }

  /**
   * params.subject - string
   * params.message - string
   * params.communityId - string
   * params.relatedUrl - string
   */
  const params = JSON.parse(event.body);

  const contacts = await loadCommunitySupportEmails(params.communityId);
  for (const contact of contacts) {
    if (contact.id) {
      await addNotificationRecord({
        user_id: contact.id,
        email: contact.email,
        related_url: params.relatedUrl,
        type: "community_admin_message",
        message: params.message,
        custom_fields: {
          subject: params.subject,
          send_email: contact.email_preferences?.send_community_admin_messages,
        },
      });
    } else {
      const message = buildCommunityAdminMessage({
        name: contact.name,
        email: contact.email,
        message: params.message,
        subject: params.subject,
        relatedUrl: params.relatedUrl,
      });
      await sendEmail(message);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
    }),
  };
};
