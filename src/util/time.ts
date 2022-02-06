import { AccessLevel, RsvpTimes } from "@/typings/AccessLevel";
import { CommunityAccess } from "@/typings/CommunityAccess";
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
