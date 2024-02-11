import * as R from "ramda";
import { supabase } from "@/supabase";
import { GameDetailBlock, GameListing, NewGame, Game } from "@/typings/Game";
import { NewSession, Session } from "@/typings/Session";
import { log } from "@/util/logger";
import { Community } from "@/typings/Community";
import {
  startOfDay,
  endOfDay,
  parse,
  isAfter,
  isBefore,
  addSeconds,
  subSeconds,
} from "date-fns";

import axios from "axios";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { SORT_DIR, SORT_KEY, sortDirs, sortKeys } from "@/util/urlParams";
import client from "./client";
import { Member } from "@/typings/Member";

// helper functions
const sortSessionByTimeAsc = (a: Session, b: Session) => {
  if (a.start_time < b.start_time) return -1;
  if (a.start_time > b.start_time) return 1;
  return 0;
};
const sortSessionsOnGame = (game: GameListing) => {
  return {
    ...game,
    sessions: game.sessions.sort(sortSessionByTimeAsc),
  };
};
const mapToAscSessions = R.map(sortSessionsOnGame);

function filterDraftEventGames(record: GameListing) {
  /**
   * A game may be associated with a DRAFT event which does not load
   * for all users, so you can not only rely on checking community_events alone.
   * If the game has an event ID, but the event isn't included in community_events,
   * exclude the game from results
   */
  if (record.event_id) {
    return record.community_events?.draft_state === "PUBLISHED";
  }
  return true;
}

export function sessionIsWithinRange({
  session,
  starttime,
  endtime,
}: {
  session: { start_time: Session["start_time"]; end_time: Session["end_time"] };
  starttime?: string | null;
  endtime?: string | null;
}) {
  const sessionStart = new Date(session.start_time);
  const sessionEnd = new Date(session.end_time);
  let startsOnTime = true;
  let endsOnTime = true;
  if (starttime) {
    // remove 30 seconds since the user time is inclusive
    const startLimit = subSeconds(parse(starttime, "HH:mm", sessionStart), 30);
    startsOnTime = isAfter(sessionStart, startLimit);
  }
  if (endtime) {
    const endLimitBasedOnStartDate = addSeconds(
      parse(endtime, "HH:mm", sessionStart),
      30
    );
    endsOnTime = isBefore(sessionEnd, endLimitBasedOnStartDate);
  }
  return startsOnTime && endsOnTime;
}

export function filterGameSessionsByTimeRange(
  record: GameListing,
  starttime?: string,
  endtime?: string
) {
  return record.sessions.some((session) =>
    sessionIsWithinRange({ session, starttime, endtime })
  );
}

export async function createGame(newGame: NewGame) {
  const { data, error } = await supabase
    .from("games")
    .insert(newGame)
    .select()
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function loadUpcomingCommunityGamesWithCount(communityId: string) {
  const { data, error, count } = await supabase
    .from("games")
    .select("*, sessions!inner(start_time)", { count: "estimated" })
    .eq("community_id", communityId)
    .gte("sessions.start_time", new Date().getTime());
  if (error) {
    log({ error });
  }
  return { data, count };
}

export async function loadUpcomingJoinedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .contains("sessions.rsvps", [userId])
    .gte("sessions.start_time", today.getTime())
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadBrowsableGames({
  sortKey = sortKeys.startTime,
  sortDir = sortDirs.asc,
  openOnly,
  isRecorded,
  usesSafetyTools,
  communities,
  minPlayer = "0",
  maxPlayer,
  system,
}: {
  sortKey?: SORT_KEY;
  sortDir?: SORT_DIR;
  openOnly: boolean;
  isRecorded: boolean;
  usesSafetyTools: boolean;
  communities: string[];
  minPlayer?: string;
  maxPlayer?: string;
  system?: string;
}) {
  const today = new Date();
  const sort: { foreignTable: string; ascending: boolean } = {
    foreignTable: [sortKeys.startTime, sortKeys.endTime].includes(sortKey)
      ? "sessions"
      : "",
    ascending: sortDir === sortDirs.asc,
  };
  const query = supabase
    .from("games")
    .select(
      "*, community_id (id, name), sessions!inner(*), community_events(*)"
    )
    .is("deleted_at", null)
    .in("sessions.has_openings", openOnly ? [true] : [true, false])
    .in("will_be_recorded", isRecorded ? [true] : [true, false])
    .in("uses_safety_tools", usesSafetyTools ? [true] : [true, false])
    .gte("participant_count", Math.max(Number(minPlayer), 0))
    .gte("sessions.start_time", today.getTime())
    .order(sortKey, sort);

  if (maxPlayer) {
    query.lte("participant_count", maxPlayer);
  }

  if (system) {
    query.ilike("system", `%${system}%`);
  }

  if (communities.length) {
    query.in("community_id", communities);
  }

  const { data, error } = await query;
  if (error) {
    log({ error });
  }
  if (data) {
    const withoutDrafts = data.filter(filterDraftEventGames);
    const sorter = R.sortBy((listing: { sessions: Session[] }) => {
      return listing?.sessions?.[0][sortKey];
    });
    const result = sorter(mapToAscSessions(withoutDrafts));
    if (sortDir === sortDirs.desc) {
      return result.reverse();
    }
    return result;
  }
}

export async function loadChronologicalCommunityGames(communityIds: string[]) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, community_id (id, name), sessions!inner(*), community_events(*)"
    )
    .is("deleted_at", null)
    .gte("sessions.start_time", today.getTime())
    .in("community_id", communityIds)
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    const withoutDrafts = data.filter(filterDraftEventGames);
    return mapToAscSessions(withoutDrafts);
  }
}

export async function loadGamesWithOpenings() {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, community_id (id, name), sessions!inner(*), community_events(*)"
    )
    .is("deleted_at", null)
    .eq("sessions.has_openings", true)
    .gte("sessions.start_time", today.getTime())
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    const withoutDrafts = data.filter(filterDraftEventGames);
    return mapToAscSessions(withoutDrafts);
  }
}

export async function loadCommunityGamesWithOpenings(communityIds: string[]) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, community_id (id, name), sessions!inner(id, start_time, has_openings), community_events(*)"
    )
    .is("deleted_at", null)
    .eq("sessions.has_openings", true)
    .gte("sessions.start_time", today.getTime())
    .in("community_id", communityIds)
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    const withoutDrafts = data.filter(filterDraftEventGames);
    return mapToAscSessions(withoutDrafts);
  }
}

export async function loadManagedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, community_id (id, name), sessions (*)")
    .gte("sessions.start_time", today.getTime())
    .eq("creator_id", userId)
    .order("start_time", { foreignTable: "sessions" });
  if (error) {
    log({ error });
  }

  if (data) {
    return data;
  }
}

export async function loadPastManagedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .lt("sessions.start_time", today.getTime())
    .eq("creator_id", userId)
    .order("start_time", { foreignTable: "sessions" });
  if (error) {
    log({ error });
  }

  if (data) {
    return data;
  }
}

export async function loadOpenCommunitySessions({
  communityId,
  startDate,
  endDate,
}: {
  communityId: Community["id"];
  startDate: Date;
  endDate: Date;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, game_id(*, community_events(*), sessions(*), community_id(*))")
    .is("deleted_at", null)
    .eq("community_id", communityId)
    .eq("has_openings", true)
    .gte("start_time", startOfDay(startDate).getTime())
    .lte("start_time", endOfDay(endDate).getTime())
    .order("start_time", { ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data.filter((record) => {
      return filterDraftEventGames(record.game_id);
    });
  }
}

export async function loadAllCommunitySessions({
  communityId,
  startDate,
  endDate,
}: {
  communityId: Community["id"];
  startDate: Date;
  endDate: Date;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, game_id(*, community_events(*), sessions(*), community_id(*))")
    .is("deleted_at", null)
    .eq("community_id", communityId)
    .gte("start_time", startOfDay(startDate).getTime())
    .lte("start_time", endOfDay(endDate).getTime())
    .order("start_time", { ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data.filter((record) => {
      return filterDraftEventGames(record.game_id);
    });
  }
}

export async function loadOpenEventSessions({ eventId }: { eventId: number }) {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, game_id!inner(*, community_events(*), sessions(*), community_id(*))"
    )
    .is("deleted_at", null)
    .eq("has_openings", true)
    .eq("game_id.event_id", eventId)
    .order("start_time", { ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadEventSessions({ eventId }: { eventId: number }) {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, game_id!inner(*, community_events(*), sessions(*), community_id(*))"
    )
    .is("deleted_at", null)
    .eq("game_id.event_id", eventId)
    .order("start_time", { ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function rsvpToAllGameSessions({
  gameSessions,
  userId,
}: {
  gameSessions: { start_time: number; id: string }[];
  userId: string;
}) {
  const now = new Date();
  const futureSessions = gameSessions.filter(
    (session) => session.start_time >= now.getTime()
  );
  const joinPromises = await Promise.allSettled(
    futureSessions.map((session) =>
      joinSession({ sessionId: session.id, userId })
    )
  );
  const failedPromises = joinPromises.filter(
    (promise) => promise.status === "rejected"
  );
  const successPromises = joinPromises.filter(
    (promise) => promise.status === "fulfilled"
  );

  return {
    totalAvailable: futureSessions.length,
    failed: failedPromises.length,
    joined: successPromises.length,
  };
}

export async function joinSession({
  sessionId,
  userId,
  skipNotifyCreator = false,
}: {
  sessionId: string;
  userId: string;
  skipNotifyCreator?: boolean;
}) {
  return client.post(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}&skipNotifyCreator=${skipNotifyCreator}`
  );
}

export async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  return client.delete(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`
  );
}

export async function sendRemovalEmail({
  toEmail,
  toName,
  gameName,
  gameId,
  sessionTime,
}: {
  toEmail: string;
  toName: string;
  gameName: string;
  gameId: number;
  sessionTime: number;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;
  await fetch(
    `/.netlify/functions/sendRemovedFromSessionMessage?toEmail=${toEmail}&toName=${toName}&gameName=${gameName}&gameId${gameId}&sessionTime=${sessionTime}`,
    {
      method: "POST",
      headers: {
        token: session.access_token,
      },
    }
  ).catch((error) => {
    log({ error });
    throw error;
  });
}

export async function loadGame(gameId: number) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadGameDetails(gameId: number) {
  const { data, error, status } = await supabase
    .from("game_details")
    .select("*")
    .eq("game_id", gameId)
    .single();
  if (error && status !== 406) {
    log({ error });
    throw error;
  }
  if (data) {
    return data;
  }
}

export async function saveGameDetails({
  id,
  gameId,
  detailBlocks,
}: {
  id?: number;
  gameId: number;
  detailBlocks: GameDetailBlock[];
}) {
  const { data, error } = await supabase
    .from("game_details")
    .upsert({
      id,
      detail_blocks: detailBlocks,
      game_id: gameId,
    })
    .select()
    .single();
  if (error) {
    log({ error });
    throw error;
  }
  if (data) {
    return data;
  }
}

export async function publishGame(game: Game) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  try {
    await axios.post(`${import.meta.env.VITE_PLAYABL_API}/publish/game`, game, {
      headers: {
        Authorization: session.access_token,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateSession(
  id: Session["id"],
  update: Partial<Session>
) {
  const { error } = await supabase
    .from("sessions")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    log({ error });
    throw new Error(error.message);
  }
  return true;
}

export async function addSession(session: Partial<Session>) {
  const { data, error } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();
  if (error) {
    log({ error });
    throw new Error(error.message);
  }
  return data;
}

export async function loadGamesAndSessionsForEvent(
  eventId: CommunityEvent["id"]
) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, sessions!inner(*), profiles(*)")
    .eq("event_id", eventId)
    .gte("sessions.start_time", today.getTime());
  if (error) {
    log({ error });
    throw new Error(error.message);
  }
  return data;
}

export async function loadDraftManagedGames(userId: string) {
  const { data, error } = await supabase
    .from("draft_games")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    log({ error });
  }

  if (data) {
    return data;
  }
}

export async function saveToDraftGames({
  id,
  gameJson,
  sessionsJson,
  preseatingJson,
  enabledAccessLevels,
  userId,
}: {
  id: string | null;
  gameJson: NewGame;
  sessionsJson: Record<string, NewSession>;
  preseatingJson: {
    [id: string]: {
      members: Member[];
    };
  };
  enabledAccessLevels: number[];
  userId: string;
}) {
  const insert = {
    id: id ?? undefined,
    game_json: gameJson,
    sessions_json: sessionsJson,
    preseating_json: preseatingJson,
    enabled_access_levels: enabledAccessLevels,
    user_id: userId,
    updated_at: new Date(),
  };

  const { error } = await supabase.from("draft_games").upsert(insert);

  if (error) {
    log({ error });
    throw new Error(error.message);
  }
}

export async function loadDraftGameById(id: number) {
  const { data, error } = await supabase
    .from("draft_games")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    log({ error });
    throw new Error(error.message);
  }

  if (data) {
    return data;
  }
}

export async function deleteDraftGame(id: number) {
  const { error } = await supabase.from("draft_games").delete().eq("id", id);

  if (error) {
    log({ error });
    throw new Error(error.message);
  }
}
