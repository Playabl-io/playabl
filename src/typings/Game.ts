import { Community } from "./Community";
import { CommunityEvent } from "./CommunityEvent";
import { Profile } from "./Profile";
import { Rsvp } from "./Rsvp";
import { Session } from "./Session";

export interface GameDetailBlock {
  id: string;
  title: string;
  content: string;
  width?: string;
}

export enum GAME_DRAFT_STATE {
  draft = "draft",
  published = "published",
}

export interface GameBase {
  id: number;
  title: string;
  description: string;
  description_as_flat_text: string;
  cover_image?: string;
  participant_count: number;
  draft_state: GAME_DRAFT_STATE;
  deleted_at?: string | null;
  created_at: string;
  system?: string;
  virtual_tabletop?: string;
  will_be_recorded?: boolean;
  uses_safety_tools?: boolean;
  event_id?: CommunityEvent["id"];
}

export interface Game extends GameBase {
  community_events?: CommunityEvent | null;
  community_id: string;
  creator_id: string;
}

export type NewGame = Omit<Game, "id" | "created_at">;

// loaded for listing games so that we can show and link the community
export type GameListing = Game & {
  community_events: CommunityEvent;
  community_id: { id: string; name: string };
  sessions: Session[];
};

export interface GameWithCommunityAndSessions extends GameBase {
  sessions: Session[];
  creator_id: Profile;
  community_id: Community;
  community_events?: CommunityEvent;
}

export interface RsvpWithSessionAndGame {
  id: string;
  user_id: string;
  sessions: {
    id: string;
    start_time: number;
    end_time: number;
    game_id: Game & {
      communities: {
        id: string;
        name: string;
      };
    };
    rsvps: Rsvp[];
  };
}
