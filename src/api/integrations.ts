import { supabase } from "@/supabase";
import { Game, GAME_DRAFT_STATE } from "@/typings/Game";
import { Integration } from "@/typings/Integration";
import { log } from "@/util/logger";
import { publishGame } from "./gamesAndSessions";

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
  integration: Omit<Integration, "id" | "created_at" | "updated_at">
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
    .update({ ...integration, updated_at: new Date() })
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

export function testGameIntegration({
  communityId,
  userId,
}: {
  communityId: string;
  userId: string;
}) {
  const testGame: Game = {
    id: 1,
    community_id: communityId,
    title: "Integration test from Playabl",
    description: "This is a test game from Playabl",
    description_as_flat_text: "This is a test game from Playabl",
    creator_id: userId,
    participant_count: 1,
    draft_state: GAME_DRAFT_STATE.published,
    created_at: new Date().getTime().toString(),
  };

  publishGame(testGame);
}
