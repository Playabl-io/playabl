import { AccessLevel, RsvpTimes } from "@/typings/AccessLevel";
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

export function rsvpTimes(accessTimes: AccessLevel[]): RsvpTimes {
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
    result[time.id] = {
      name: time.name,
      rsvpAvailableTime: roundToNearestMinutes(rsvpDate).getTime(),
    };
  });
  return result;
}

export function compareUserAccessToRsvpTimes(
  userAccess: CommunityAccess[],
  rsvpTimes: RsvpTimes
) {
  const access = userAccess.map((access) => {
    const rsvpTime = rsvpTimes[access.access_level_id]?.rsvpAvailableTime;
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
  session: GameSession;
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
