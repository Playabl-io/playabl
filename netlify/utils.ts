import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export async function authenticateUser(event) {
  const { authorization } = event.headers;

  const user = await supabase.auth.getUser(authorization);

  if (user?.data?.user?.aud === "authenticated") {
    return user;
  }
}

export async function userIsCommunityAdmin({ userId, communityId }) {
  const { data, error } = await supabase
    .from("community_memberships")
    .select("*")
    .eq("community_id", communityId)
    .eq("user_id", userId);
  if (error && error.code === "409") {
    return false;
  }
  if (data) {
    return true;
  }
}

export function sendEmail(message) {
  return sendEmails([message]);
}

export function sendEmails(messages) {
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

export async function loadCommunitySupportEmails(communityId: string): Promise<
  {
    name: string;
    email: string;
    id?: string;
    email_preferences?: Record<string, boolean>;
  }[]
> {
  const community = await loadCommunity(communityId);
  const admins = await loadCommunityAdmins(communityId);
  let contacts = [];
  contacts = contacts.concat(admins);

  if (community.support_email) {
    contacts = contacts.concat({
      name: community.name,
      email: community.support_email,
    });
  }

  return contacts;
}

async function loadCommunity(communityId: string) {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (error) {
    console.error({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadCommunityAdmins(communityId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, community_memberships!inner(community_id, role_id)")
    .eq("community_memberships.community_id", communityId)
    .eq("community_memberships.role_id", 1);

  if (error) {
    console.error({ error });
  }
  if (data) {
    return data.map((profile) => ({
      name: profile.username,
      email: profile.email,
      id: profile.id,
      email_preferences: profile.email_preferences,
    }));
  }
}

export async function addNotificationRecord(notification: {
  user_id: string;
  user_name?: string;
  email: string;
  message: string;
  related_url: string;
  type: "community_admin_message";
  custom_fields: unknown;
}) {
  const { error } = await supabase.from("notifications").insert(notification);
  if (error) {
    throw error;
  }
}

export function buildCommunityAdminMessage({
  name,
  email,
  message,
  subject,
  relatedUrl,
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
    TemplateID: 4954812,
    TemplateLanguage: true,
    Subject: subject,
    Variables: {
      message,
      subject,
      related_url: relatedUrl,
    },
  };
}
