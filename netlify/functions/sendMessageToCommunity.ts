import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event) => {
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

  const params = JSON.parse(event.body);

  const community = await loadCommunity(params.communityId);
  const noSubscriptions =
    !community.support_message_subscriptions ||
    community.support_message_subscriptions?.length === 0;
  let contacts = [];
  if (!community.support_email && noSubscriptions) {
    contacts = await loadCommunityAdmins(params.communityId);
  }
  if (community.support_email) {
    contacts = [{ name: community.name, email: community.support_email }];
  }
  if (Array.isArray(community.support_message_subscriptions)) {
    contacts = contacts.concat(community.support_message_subscriptions);
  }

  const messages = contacts.map((contact) =>
    buildMessage({
      name: contact.name,
      email: contact.email,
      message: params.message,
      responseEmail: params.responseEmail,
      communityName: community.name,
    })
  );

  try {
    await sendCommunityContactEmail({ messages });
    console.info("succesfully sent messages");
  } catch (error) {
    console.error("unable to send messages", error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
    }),
  };
};

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

async function loadCommunityAdmins(communityId: string) {
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
    }));
  }
}

function sendCommunityContactEmail({ messages }: { messages: unknown[] }) {
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

function buildMessage({ name, email, message, responseEmail, communityName }) {
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
    TemplateID: 3904163,
    TemplateLanguage: true,
    Subject: `New Community Message on Playabl - ${communityName}`,
    Variables: {
      communityName,
      message,
      responseEmail: responseEmail || "Anonymous",
    },
  };
}
