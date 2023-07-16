export enum ACCESS_LEVEL_TIME_DENOMINATION {
  hours = "hours",
  days = "days",
  weeks = "weeks",
}

export interface AccessLevel {
  id: number;
  name: string;
  priority_access_time: number;
  time_denomination: ACCESS_LEVEL_TIME_DENOMINATION;
  is_mandatory: boolean;
  community_id: string;
  apply_on_join: boolean;
}

export type NewAccessLevel = Omit<AccessLevel, "id">;

// Used to compute at what time an access level can RSVP
export type RsvpTimes = Record<
  string,
  { rsvpAvailableTime: number; name: string; humanReadableRsvpTime: string }
>;
