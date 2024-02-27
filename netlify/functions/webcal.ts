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

  function sessionToCalFormat(session) {
    return {
      startTime: session.start_time,
      endTime: session.end_time,
      title: session.game_id.title,
      gameId: session.game_id.id,
      description: session.game_id.description_as_flat_text,
    };
  }
  const events = playingSessions
    .map(sessionToCalFormat)
    .concat(managingSessions.map(sessionToCalFormat));
  const ics = createIcs(events);

  return {
    statusCode: 200,
    body: JSON.stringify(ics),
  };
};

function createIcs(
  events: {
    startTime: number;
    endTime: number;
    title: string;
    gameId: number | string;
    description: string;
  }[]
) {
  const { value } = ics.createEvents(
    events.map((event) => ({
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
      busyStatus: "BUSY",
      description: `Game URL - https://app.playabl.io/games/${event.gameId}`,
    }))
  );
  return value;
}
