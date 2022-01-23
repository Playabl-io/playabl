export enum GAME_DRAFT_STATE {
  draft = "draft",
  published = "published",
}

export interface Game {
  id?: string;
  title: string;
  description: string;
  cover_image?: string;
  participant_count: number;
  draft_state: GAME_DRAFT_STATE;
  deleted_at?: string;
  access_times?: unknown;
  created_at?: string;
  community_id: string;
}
