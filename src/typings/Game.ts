import { Rsvp } from "./Rsvp";
import { Session, SessionWithRsvps } from "./Session";

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
  deleted_at?: string;
  created_at: string;
  community_id: string;
  creator_id: string;
}

export type NewGame = Omit<Game, "id" | "created_at">;

// loaded for listing games so that we can show and link the community
export type GameListing = Game & {
  community_id: { id: string; name: string };
  sessions: Session[];
};

export type GameWithSessionsAndRsvps = Game & { sessions: SessionWithRsvps[] };

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
