import { Game, GAME_DRAFT_STATE } from "@/typings/Game";
import { Session } from "@/typings/Session";
import { reactive } from "vue";

interface Store {
  game: Game;
  sessions: Session[];
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
});
