import { describe, test, expect } from "vitest";
import { userCanRsvp, rsvpTimes } from "./time";
import { add, roundToNearestMinutes } from "date-fns";
import {
  AccessLevel,
  ACCESS_LEVEL_TIME_DENOMINATION,
} from "@/typings/AccessLevel";

const SESSION = {
  id: 150,
  created_at: "2023-06-30T14:28:44.044046+00:00",
  start_time: 1689944400000,
  end_time: 1689951600000,
  game_id: 99,
  access_times: '{"17":{"name":"default","rsvpAvailableTime":1688135340000}}',
  creator_id: "2",
  has_openings: true,
  participant_count: 3,
  community_id: "community-a",
  rsvps: ["3"],
  deleted_at: null,
};

function getFutureTime() {
  const date = new Date();
  date.setDate(date.getDate() + 10000);
  return date.getTime();
}

function setAccessTime(value: number) {
  return `{"17":{"name":"default","rsvpAvailableTime":${value}}}`;
}

const USER_ACCESS = [
  {
    id: 74,
    created_at: "2023-03-11T15:29:20.564013+00:00",
    user_id: "1",
    community_id: "community-a",
    access_level_id: 16,
  },
  {
    id: 75,
    created_at: "2023-03-11T15:29:20.564013+00:00",
    user_id: "1",
    community_id: "community-a",
    access_level_id: 15,
  },
  {
    id: 76,
    created_at: "2023-03-11T15:32:48.143969+00:00",
    user_id: "1",
    community_id: "community-b",
    access_level_id: 17,
  },
  {
    id: 78,
    created_at: "2023-04-06T14:49:27.943411+00:00",
    user_id: "1",
    community_id: "community-c",
    access_level_id: 19,
  },
];

describe("time util", () => {
  describe("userCanRsvp", () => {
    test("User is not host and has access policy", () => {
      expect(
        userCanRsvp({
          userAccess: USER_ACCESS,
          session: SESSION,
          hostId: "2",
          userId: "1",
        })
      ).toBe(true);
    });

    test("User is host", () => {
      expect(
        userCanRsvp({
          userAccess: USER_ACCESS,
          session: SESSION,
          hostId: "1",
          userId: "1",
        })
      ).toBe(false);
    });

    test("User is missing access policy", () => {
      expect(
        userCanRsvp({
          userAccess: USER_ACCESS.filter(
            (policy) => policy.access_level_id !== 17
          ),
          session: SESSION,
          hostId: "2",
          userId: "1",
        })
      ).toBe(false);
    });

    test("RSVP time is in the future", () => {
      const localSession = {
        ...SESSION,
      };
      const future = getFutureTime();
      localSession.access_times = setAccessTime(future);
      expect(
        userCanRsvp({
          userAccess: USER_ACCESS,
          session: localSession,
          hostId: "2",
          userId: "1",
        })
      ).toBe(false);
    });

    test("User is rsvpd already", () => {
      const localSession = {
        ...SESSION,
      };
      localSession.rsvps.push("1");
      expect(
        userCanRsvp({
          userAccess: USER_ACCESS,
          session: localSession,
          hostId: "2",
          userId: "1",
        })
      ).toBe(false);
    });
  });

  describe("rsvpTimes", () => {
    const ACCESS_POLICIES: AccessLevel[] = [
      {
        id: 1,
        name: "days policy",
        priority_access_time: 1,
        time_denomination: ACCESS_LEVEL_TIME_DENOMINATION.days,
        is_mandatory: false,
        community_id: "1",
        apply_on_join: false,
      },
      {
        id: 2,
        name: "hours policy",
        priority_access_time: 4,
        time_denomination: ACCESS_LEVEL_TIME_DENOMINATION.hours,
        is_mandatory: false,
        community_id: "1",
        apply_on_join: false,
      },
    ];

    test("computes the expected times", () => {
      const date = new Date();
      const result = rsvpTimes(ACCESS_POLICIES);
      const oneDayPriorityTime = roundToNearestMinutes(add(date, { days: 1 }));
      const fourHourPriorityTime = roundToNearestMinutes(
        add(date, { hours: 20 })
      );
      expect(result[1].rsvpAvailableTime).toBeCloseTo(
        roundToNearestMinutes(date).getTime()
      );
      expect(result.default.rsvpAvailableTime).toBeCloseTo(
        oneDayPriorityTime.getTime()
      );
      expect(result[2].rsvpAvailableTime).toBeCloseTo(
        fourHourPriorityTime.getTime()
      );
    });
  });
});
