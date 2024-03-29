import { Community, SignupMethods } from "@/typings/Community";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { Game, GAME_DRAFT_STATE } from "@/typings/Game";
import { Profile } from "@/typings/Profile";
import { Session } from "@/typings/Session";
import { reactive } from "vue";

interface Store {
  game: Game & { community_events?: CommunityEvent };
  sessions: Session[];
  attendees: Record<string, Profile>;
  community: Community;
  coverImage?: string;
}

const DEFAULT_GAME_STATE = {
  game: {
    id: 0,
    title: "",
    participant_count: 0,
    draft_state: GAME_DRAFT_STATE.published,
    community_id: "",
    created_at: "",
    creator_id: "",
    description: "",
    description_as_flat_text: "",
  },
  sessions: [],
  attendees: {},
  community: {
    id: "",
    name: "",
    allow_public_signup: false,
    created_at: "",
    signup_method: SignupMethods.PRIVATE,
    allow_pre_seat: false,
  },
};

export let gameStore = reactive<Store>({ ...DEFAULT_GAME_STATE });

export function clearGameStore() {
  gameStore = reactive<Store>({ ...DEFAULT_GAME_STATE });
}
