export interface Community {
  id: string;
  name: string;
  description?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  allow_public_signup: boolean;
  created_at: string;
  furthest_posting_date?: string;
}
