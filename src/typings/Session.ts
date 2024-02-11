import { Game } from "./Game";

export interface Session {
  id: string;
  created_at: string;
  start_time: number;
  end_time: number;
  game_id: number;
  community_id: string;
  access_times?: string;
  creator_id: string;
  participant_count: number;
  has_openings: boolean;
  rsvps: string[];
}

export type NewSession = Omit<Session, "id" | "created_at">;

/**
 * Used for Calendar and List displays
 */
export type GameSession = Omit<Session, "game_id"> & {
  game_id: Game;
};
