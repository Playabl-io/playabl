export interface Profile {
  username?: string;
  email: string;
  avatar_url?: string;
  pronouns?: string;
  website?: string;
  twitter?: string;
  bio?: string;
  id: string;
  email_preferences?: {
    email_enabled: boolean;
    unread_notifications_enabled: boolean;
    rsvp_to_my_game_enabled: boolean;
    send_community_admin_messages: boolean;
  };
  user_settings: {
    starttime?: string | null;
    endtime?: string | null;
  } | null;
}
