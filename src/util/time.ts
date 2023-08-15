import { AccessLevel, RsvpTimes } from "@/typings/AccessLevel";
import { Community } from "@/typings/Community";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { Profile } from "@/typings/Profile";
import { GameSession } from "@/typings/Session";
import {
  addHours,
  addDays,
  addWeeks,
  max,
  subHours,
  subDays,
  subWeeks,
  roundToNearestMinutes,
  isBefore,
  min,
  startOfDay,
  format,
} from "date-fns";

const maxTimeMapper = {
  hours: addHours,
  days: addDays,
  weeks: addWeeks,
};
const timeBeforeMapper = {
  hours: subHours,
  days: subDays,
  weeks: subWeeks,
};

export function rsvpTimes(
  accessTimes: AccessLevel[],
  defaultOverride?: number,
  overrideBehavior: "global" | "policy" = "policy"
): RsvpTimes {
  /**
   * All priority periods run concurrently. This means the policy with the longest priority
   * decides the end time when all policies end together. So get that future time,
   * then subtract the duration of the others to figure out when they go into effect.
   */
  const now = new Date();
  const result: RsvpTimes = {};
  const times = accessTimes.map((time) => {
    return maxTimeMapper[time.time_denomination]?.(
      now,
      time.priority_access_time
    );
  });
  const maxTime = max(times);
  accessTimes.forEach((time) => {
    const rsvpDate = timeBeforeMapper[time.time_denomination]?.(
      maxTime,
      time.priority_access_time
    );
    const rounded = roundToNearestMinutes(defaultOverride || rsvpDate);

    result[time.id] = {
      name: time.name,
      rsvpAvailableTime: rounded.getTime(),
      humanReadableRsvpTime: rounded.toLocaleString(),
    };
  });
  /**
   * IMPORTANT: We only write default in cases where everyone should have
   * access since the presence of this key will be checked in
   * compareUserAccessToRsvpTimes
   */
  if (overrideBehavior === "global" && Number.isInteger(defaultOverride)) {
    const time = roundToNearestMinutes(Number(defaultOverride));
    result.default = {
      name: "default",
      rsvpAvailableTime: time.getTime(),
      humanReadableRsvpTime: time.toLocaleString(),
    };
  }
  return result;
}

export function compareUserAccessToRsvpTimes(
  userAccess: CommunityAccess[],
  rsvpTimes: RsvpTimes
) {
  const access = userAccess.map((access) => {
    /**
     * Default value overrides. It is assumed community access has been checked already
     */
    const rsvpTime =
      rsvpTimes.default?.rsvpAvailableTime ||
      rsvpTimes[access.access_level_id]?.rsvpAvailableTime;
    if (!rsvpTime) return false;
    return isBefore(new Date(rsvpTime), new Date());
  });
  return access.some((level) => level === true);
}

export function userCanRsvp({
  userAccess,
  session,
  userId,
  hostId,
}: {
  userAccess: CommunityAccess[];
  session: {
    rsvps: GameSession["rsvps"];
    start_time: GameSession["start_time"];
    access_times?: GameSession["access_times"];
    community_id: Community["id"];
  };
  userId?: Profile["id"];
  hostId: string;
}): boolean {
  /**
   * Confirm user is signed in, not the host, and not rsvpd
   */
  if (!userId) return false;
  if (userId === hostId) {
    return false;
  }
  if (session.rsvps.includes(userId)) {
    return false;
  }
  /**
   * Confirm session is in the future
   */
  if (isBefore(session.start_time, new Date())) {
    return false;
  }
  /**
   * Compare user access to session access
   */
  let sessionAccessTimes: RsvpTimes;
  if (typeof session.access_times === "string") {
    sessionAccessTimes = JSON.parse(session.access_times);
  } else {
    return false;
  }
  return compareUserAccessToRsvpTimes(userAccess, sessionAccessTimes);
}

export function getSoonestRsvpTime(
  userAccess: CommunityAccess[],
  rsvpTimes: RsvpTimes
) {
  const possibleTimes = userAccess
    .map((access) => rsvpTimes[access.access_level_id]?.rsvpAvailableTime)
    .filter(Boolean);
  if (possibleTimes.length === 0) return null;
  return min(possibleTimes);
}

export function getStartOfToday() {
  return startOfDay(new Date());
}

export function getUserTimezone() {
  return format(getStartOfToday(), "OOOO");
}
