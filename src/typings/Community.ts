export interface Community {
  id: string;
  support_email?: string;
  support_message_subscriptions?: { name: string; email: string }[];
  name: string;
  description?: string;
  cover_image?: string;
  how_to_join?: string;
  website?: string;
  code_of_conduct_url?: string;
  game_types?: string[];
  twitter?: string | null;
  discord?: string | null;
  slack?: string | null;
  patreon?: string | null;
  facebook?: string | null;
  allow_public_signup: boolean;
  created_at: string;
  furthest_posting_date?: number | null; // unix epoch number
  stripe_account_id?: string;
  join_price_id?: string; // stripe price ID
  join_payment_link?: string; // stripe payment link
  join_payment_link_id?: string; // id of payment link
}
