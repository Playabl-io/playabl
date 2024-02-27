import { Handler } from "@netlify/functions";
import * as ics from "ics";
import { format } from "date-fns";
import { logError, supabase } from "../utils";

export const handler: Handler = async (event) => {
  const { id } = event.queryStringParameters;

  const { data, error } = await supabase
    .from("user_calendars")
    .select("user_id")
    .eq("webcal_id", id)
    .single();

  if (error) {
    return {
      statusCode: 404,
    };
  }

  const { data: playingSessions, error: playingError } = await supabase
    .from("sessions")
    .select("*, game_id(*)")
    .is("deleted_at", null)
    .contains("rsvps", [data.user_id])
    .gte("start_time", new Date().getTime());

  if (playingError) {
    logError({
      message: `Error loading playing sessions in webcal: ${playingError}`,
    });
  }

  const { data: managingSessions, error: managingError } = await supabase
    .from("sessions")
    .select("*, game_id(*)")
    .is("deleted_at", null)
    .eq("creator_id", data.user_id)
    .gte("start_time", new Date().getTime());

  if (managingError) {
    logError({
      message: `Error loading managing sessions in webcal: ${managingError}`,
    });
  }

  const PLAYER_ROLE = "player";
  function sessionToIcal({ session, userId, role }) {
    let title = `${session.game_id.title} (Game Facilitator)`;
    if (role === PLAYER_ROLE) {
      title =
        session.rsvps.indexOf(userId) < session.participant_count
          ? `${session.game_id.title} (Confirmed Player)`
          : `${session.game_id.title} (Waitlisted Player)`;
    }
    return {
      uid: `${session.id}#${userId}@playabl`,
      startTime: session.start_time,
      endTime: session.end_time,
      title,
      gameId: session.game_id.id,
      description: `<!DOCTYPE html><html><body>${session.game_id.description}</body></html>`,
    };
  }
  const events = playingSessions
    .map((session) =>
      sessionToIcal({ session, userId: data.user_id, role: PLAYER_ROLE })
    )
    .concat(
      managingSessions.map((session) =>
        sessionToIcal({ session, userId: data.user_id, role: "creator" })
      )
    );
  const ics = createIcs(events);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/calendar;charset=utf8",
    },
    body: ics,
  };
};

function createIcs(
  events: {
    uid: string;
    startTime: number;
    endTime: number;
    title: string;
    gameId: number | string;
    description: string;
  }[]
) {
  const { value } = ics.createEvents(
    events.map((event) => ({
      uid: event.uid,
      start: format(event.startTime, "yyyy-M-d-H-m")
        .split("-")
        .map((val) => parseInt(val)) as [
        number,
        number,
        number,
        number,
        number,
      ],
      end: format(event.endTime, "yyyy-M-d-H-m")
        .split("-")
        .map((val) => parseInt(val)) as [
        number,
        number,
        number,
        number,
        number,
      ],
      title: event.title,
      url: `https://app.playabl.io/games/${event.gameId}`,
      location: `https://app.playabl.io/games/${event.gameId}`,
      busyStatus: "BUSY",
      description: event.description,
    }))
  );
  return value;
}
