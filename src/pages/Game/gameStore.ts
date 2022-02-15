import { Community } from "@/typings/Community";
import { Game, GAME_DRAFT_STATE } from "@/typings/Game";
import { Profile } from "@/typings/Profile";
import { Session } from "@/typings/Session";
import { reactive } from "vue";

interface Store {
  game: Game;
  sessions: Session[];
  attendees: Record<string, Profile>;
  community: Community;
}

export const gameStore = reactive<Store>({
  game: {
    id: 0,
    title: "",
    participant_count: 0,
    draft_state: GAME_DRAFT_STATE.published,
    community_id: "",
    created_at: "",
    creator_id: "",
    description: "",
  },
  sessions: [],
  attendees: {},
  community: {
    id: "",
    name: "",
    allow_public_signup: false,
    created_at: "",
  },
});
