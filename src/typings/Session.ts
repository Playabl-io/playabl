export interface Session {
  id: string;
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

export type NewSession = Omit<Session, "id">;
