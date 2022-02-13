import { Profile } from "./Profile";
import { Rsvp } from "./Rsvp";
import { Session } from "./Session";

export enum GAME_DRAFT_STATE {
  draft = "draft",
  published = "published",
}

export interface Game {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  participant_count: number;
  draft_state: GAME_DRAFT_STATE;
  deleted_at?: string | null;
  created_at: string;
  community_id: string;
  creator_id: string;
  system?: string;
  virtual_tabletop?: string;
  will_be_recorded?: boolean;
}

export type NewGame = Omit<Game, "id" | "created_at">;

// loaded for listing games so that we can show and link the community
export type GameListing = Game & {
  community_id: { id: string; name: string };
  sessions: Session[];
};

export type GameWithSessionsAndRsvps = Omit<Game, "creator_id"> & {
  sessions: Session[];
  creator_id: Profile;
};

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
