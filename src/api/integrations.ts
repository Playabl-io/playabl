import { supabase } from "@/supabase";
import { Integration } from "@/typings/Integration";
import { makeSlackMessage } from "@/util/integrations";
import { log } from "@/util/logger";
import axios from "axios";

export async function loadCommunityIntegrations(communityId: string) {
  const { data, error, status } = await supabase
    .from("integrations")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at");
  if (error && status !== 406) {
    log({ error });
    throw error;
  }
  return data;
}

export async function createCommunityIntegration(
  integration: Omit<Integration, "id">
) {
  const { data, error } = await supabase
    .from("integrations")
    .insert(integration)
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function updateCommunityIntegration(integration: Integration) {
  const { data, error } = await supabase
    .from("integrations")
    .update(integration)
    .eq("id", integration.id)
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function deleteCommunityIntegration(integration: Integration) {
  const { data, error } = await supabase
    .from("integrations")
    .delete()
    .eq("id", integration.id)
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export function testIntegration(integration: Integration) {
  let message = {};
  if (integration.type === "slack") {
    message = makeSlackMessage({
      creator: "Playabl",
      name: "Quest for the important thing",
      description:
        "Embark on a quest for a thing to do that other thing with friends along the way.\nBut be cautious, for danger lurks ahead and the path is not clear.",
      imageUrl: "https://unsplash.com/photos/cf-ZRVtH6kE",
      url: "https://app.playabl.io",
    });
  } else if (integration.type === "discord") {
    message = {
      embeds: [
        {
          title: "Test",
          description: "Hi from Playabl",
        },
      ],
    };
  } else {
    message = {};
  }

  return axios.post(integration.endpoint, message);
}
