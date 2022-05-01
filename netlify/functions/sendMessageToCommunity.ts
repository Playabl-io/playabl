import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event, context) => {
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
  let contacts;
  if (community.support_email) {
    contacts = [{ name: community.name, email: community.support_email }];
  } else {
    contacts = await loadCommunityAdmins(params.communityId);
  }

  contacts.forEach((contact) =>
    sendCommunityContactEmail({
      name: contact.name,
      email: contact.email,
      message: params.message,
      responseEmail: params.responseEmail,
      communityName: community.name,
    })
  );

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

function sendCommunityContactEmail({
  name,
  email,
  message,
  responseEmail,
  communityName,
}) {
  return axios
    .post(
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
            TemplateID: 3904163,
            TemplateLanguage: true,
            Subject: "New Community Message",
            Variables: {
              communityName,
              message,
              responseEmail: responseEmail || "Anonymous",
            },
          },
        ],
      },
      {
        auth: {
          username: process.env.MJ_USER,
          password: process.env.MJ_PW,
        },
      }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
}
