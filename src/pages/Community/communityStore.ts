import { supabase } from "@/supabase";
import { Community } from "@/typings/Community";
import { Game } from "@/typings/Game";
import { log } from "@/util/logger";
import { reactive } from "vue";

interface Store {
  coverImageUrl?: string;
  gamesCount: number;
  games: Game[];
  membersCount: number;
  isAdmin: boolean;
  isCreator: boolean;
  isPlayer: boolean;
  community: Community;
}

export const communityStore = reactive<Store>({
  gamesCount: 0,
  games: [],
  membersCount: 0,
  isAdmin: false,
  isCreator: false,
  isPlayer: false,
  community: {
    id: "",
    name: "",
    allow_public_signup: false,
    created_at: "",
  },
});

export async function getGames(communityId: string) {
  const { data, error, count } = await supabase
    .from("games")
    .select("*, sessions!inner(start_time)", { count: "estimated" })
    .eq("community_id", communityId)
    .gte("sessions.start_time", new Date().getTime());
  if (count) {
    communityStore.gamesCount = count;
  }
  if (data) {
    communityStore.games = data;
  }
  if (error) {
    log({ error });
  }
}

export async function getMemberCount(communityId: string) {
  const { error, count } = await supabase
    .from("community_memberships")
    .select("*", { count: "estimated" })
    .eq("community_id", communityId);
  if (count !== null) {
    communityStore.membersCount = count;
  }
  if (error) {
    log({ error });
  }
}
