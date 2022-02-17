export interface Community {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  how_to_join?: string;
  website?: string;
  code_of_conduct_url?: string;
  game_types?: string[];
  twitter?: string;
  discord?: string;
  slack?: string;
  facebook?: string;
  allow_public_signup: boolean;
  created_at: string;
  furthest_posting_date?: number | null; // unix epoch number
}
