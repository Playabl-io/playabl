export enum ACCESS_LEVEL_TIME_DENOMINATION {
  hours = "hours",
  days = "days",
  weeks = "weeks",
}

export interface AccessLevel {
  id: string;
  name: string;
  priority_access_time: number;
  time_denomination: ACCESS_LEVEL_TIME_DENOMINATION;
  is_mandatory: boolean;
  community_id: string;
}

export type NewAccessLevel = Omit<AccessLevel, "id">;
