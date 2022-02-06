import { Profile } from "./Profile";

interface BaseRsvp {
  id: string;
  created_at: string;
  session_id: string;
}

export interface Rsvp extends BaseRsvp {
  id: string;
  created_at: string;
  session_id: string;
  user_id: string;
}

export interface RsvpWithUser extends BaseRsvp {
  user_id: Profile;
}
