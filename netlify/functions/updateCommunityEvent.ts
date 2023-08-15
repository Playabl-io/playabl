import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import * as R from "ramda";
import { authenticateUser, userIsCommunityAdmin } from "../utils";
import { rsvpTimes } from "../../src/util/time";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export const handler: Handler = async (event) => {
  const user = await authenticateUser(event);
  if (!user) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }
  const communityEvent = JSON.parse(event.body);
  const isAdmin = userIsCommunityAdmin({
    userId: user.data.user.id,
    communityId: communityEvent.community_id,
  });
  if (!isAdmin) {
    return {
      statusCode: 403,
      body: "not authorized",
    };
  }

  const { data: current, error: currentError } = await supabase
    .from("community_events")
    .select("*")
    .eq("id", communityEvent.id)
    .single();

  if (currentError) {
    console.error(currentError);
    return {
      statusCode: 400,
      body: "No event matching event ID" + communityEvent.id,
    };
  }

  const { data: eventSessions } = await supabase
    .from("sessions")
    .select("*, game_id!inner(*)")
    .is("deleted_at", null)
    .eq("game_id.event_id", communityEvent.id)
    .order("start_time", { ascending: true });

  if (eventSessions.length > 0) {
    console.log("need to remap sessions");
    if (
      R.difference([
        current.event_access_levels,
        communityEvent.event_access_levels,
      ]).length > 0 ||
      current.fixed_access_time !== communityEvent.fixed_access_time ||
      current.start_time !== communityEvent.start_time
    ) {
      /**
       * Access settings changed, so all RSVP times must be recalculated
       */
      const { data: accessLevels } = await supabase
        .from("access_levels")
        .select("*")
        .in("id", communityEvent.event_access_levels ?? []);

      const levels = accessLevels ?? [];
      const times = rsvpTimes(
        levels ?? [],
        communityEvent.fixed_access_time ?? undefined,
        levels.length > 0 ? "policy" : "global"
      );

      const sessionsToCreate = eventSessions.map((session) => {
        const newTime = computeNextStartAndEndTime({
          sessionStart: session.start_time,
          sessionEnd: session.end_time,
          eventStart: communityEvent.start_time,
          eventEnd: communityEvent.end_time,
        });
        return {
          ...session,
          start_time: newTime.start_time,
          end_time: newTime.end_time,
          access_times: JSON.stringify(times),
          // since our select had a nested table, we need to unnest
          game_id: session.game_id.id,
        };
      }, []);

      console.log(sessionsToCreate);

      const { data: createdSessions } = await supabase
        .from("sessions")
        .upsert(sessionsToCreate)
        .select();

      console.log("updated sessions", createdSessions);
    }
  }

  communityEvent.fixed_access_time = communityEvent.fixed_access_time || null;
  const { data, error } = await supabase
    .from("community_events")
    .update(communityEvent)
    .eq("id", communityEvent.id)
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(data),
  };
};

function computeNextStartAndEndTime({
  sessionStart,
  eventStart,
  sessionEnd,
  eventEnd,
}: {
  sessionStart: number;
  eventStart: number;
  sessionEnd: number;
  eventEnd: number;
}) {
  const length = sessionEnd - sessionStart;
  const newTime = {
    start_time: sessionStart,
    end_time: sessionEnd,
  };
  if (sessionStart < eventStart) {
    // start time is after
    newTime.start_time = eventStart;
    newTime.end_time = eventStart + length;
  } else if (sessionEnd > eventEnd) {
    newTime.start_time = eventEnd - length;
    newTime.end_time = eventEnd;
  }
  return newTime;
}
