import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import FormData from "form-data";

export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE as string
);

export const handler: Handler = async (event) => {
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const clientId = process.env.VITE_SLACK_CLIENT_ID;
  const redirectUri = process.env.VITE_SLACK_REDIRECT_URI;

  const { code, integrationId } = event.queryStringParameters as {
    code: string;
    integrationId: string;
  };

  if (!clientSecret || !clientId || !integrationId) {
    return {
      statusCode: 404,
    };
  }

  const form = new FormData();
  form.append("code", code);
  form.append("client_secret", clientSecret);
  form.append("client_id", clientId);
  form.append("redirect_uri", redirectUri);

  const response = await axios({
    url: "https://slack.com/api/oauth.v2.access",
    method: "post",
    data: form,
    headers: {
      ...form.getHeaders(),
    },
  });

  if (!response.data.ok) {
    return {
      statusCode: 400,
      message: response.data.error,
    };
  }

  const { access_token: accessToken, incoming_webhook: incomingWebhook } =
    response.data;

  const { data, error } = await supabase
    .from("integrations")
    .update({
      slack_access_token: accessToken,
      slack_configuration: {
        url: incomingWebhook.url,
        channel: incomingWebhook.channel,
        configuration_url: incomingWebhook.configuration_url,
      },
      endpoint: incomingWebhook.url,
    })
    .eq("id", integrationId)
    .select()
    .single();
  if (error) {
    return {
      statusCode: 400,
      message: error.message,
    };
  }
  if (data) {
    return {
      statusCode: 201,
    };
  }
  return {
    statusCode: 500,
  };
};
