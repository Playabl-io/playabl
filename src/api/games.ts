import * as R from "ramda";
import { supabase } from "@/supabase";
import { GameListing, NewGame } from "@/typings/Game";
import { Session } from "@/typings/Session";
import { log } from "@/util/logger";

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

export async function createGame(newGame: NewGame) {
  const { data, error } = await supabase.from("games").insert(newGame).single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function loadJoinedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from<GameListing>("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .contains("sessions.rsvps", [userId])
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadChronologicalCommunityGames(communityIds: string[]) {
  const today = new Date();
  const { data, error } = await supabase
    .from<GameListing>("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .is("deleted_at", null)
    .gte("sessions.start_time", today.getTime())
    .in("community_id", communityIds)
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return mapToAscSessions(data);
  }
}

export async function loadCommunityGamesWithOpenings(communityIds: string[]) {
  const today = new Date();
  const { data, error } = await supabase
    .from<GameListing>("games")
    .select(
      "*, community_id (id, name), sessions (id, start_time, has_openings)"
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
    return mapToAscSessions(data);
  }
}

export async function loadManagedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from<GameListing>("games")
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
    .from<GameListing>("games")
    .select("*, community_id (id, name), sessions (*)")
    .lt("sessions.start_time", today.getTime())
    .eq("creator_id", userId)
    .order("start_time", { foreignTable: "sessions", ascending: false });
  if (error) {
    log({ error });
  }
  console.log(data);

  if (data) {
    return data;
  }
}

export async function joinSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "POST",
    }
  ).then((response) => response.json());
  return data;
}

export async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "DELETE",
    }
  ).then((response) => response.json());
  return data;
}
