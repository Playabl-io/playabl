import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import axios from "axios";

export async function sendMessageToCommunity({
  message,
  responseEmail,
  communityId,
}: {
  message: string;
  communityId: string;
  responseEmail?: string;
}) {
  const session = supabase.auth.session();
  if (!session?.access_token) return;
  try {
    const data = await axios({
      url: `/.netlify/functions/sendMessageToCommunity`,
      method: "POST",
      headers: {
        token: session.access_token,
      },
      data: {
        message,
        communityId,
        responseEmail,
      },
    });
    return data;
  } catch (error) {
    log({ error });
    throw error;
  }
}

export async function sendMessageAboutGame({
  message,
  responseEmail,
  group,
  gameId,
}: {
  message: string;
  responseEmail?: string;
  group: "rsvp only" | "all players" | "creator" | "all";
  gameId: number;
}) {
  const session = supabase.auth.session();
  if (!session?.access_token) return;
  try {
    const data = await axios({
      url: `/.netlify/functions/sendMessageAboutGame`,
      method: "POST",
      headers: {
        token: session.access_token,
      },
      data: {
        message,
        responseEmail,
        group,
        gameId,
      },
    });
    return data;
  } catch (error) {
    log({ error });
    throw error;
  }
}
