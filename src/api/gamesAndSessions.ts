import * as R from "ramda";
import { supabase } from "@/supabase";
import { GameDetailBlock, GameListing, NewGame, Game } from "@/typings/Game";
import { GameSession, Session } from "@/typings/Session";
import { log } from "@/util/logger";
import { Community } from "@/typings/Community";
import { startOfDay, endOfDay } from "date-fns";

import axios from "axios";

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

export async function loadChronologicalGames() {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .is("deleted_at", null)
    .gte("sessions.start_time", today.getTime())
    .order("start_time", { foreignTable: "sessions", ascending: true });
  if (error) {
    log({ error });
  }
  if (data) {
    return mapToAscSessions(data);
  }
}

export async function loadChronologicalCommunityGames(communityIds: string[]) {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
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

export async function loadGamesWithOpenings() {
  const today = new Date();
  const { data, error } = await supabase
    .from("games")
    .select("*, community_id (id, name), sessions!inner(*)")
    .is("deleted_at", null)
    .eq("sessions.has_openings", true)
    .gte("sessions.start_time", today.getTime())
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
    .from("games")
    .select(
      "*, community_id (id, name), sessions!inner(id, start_time, has_openings)"
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
    .from("games")
    .select("*, community_id (id, name), sessions!inner(*)")
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
    .select("*, game_id (*)")
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
    return data;
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
    .select("*, game_id (*)")
    .is("deleted_at", null)
    .eq("community_id", communityId)
    .gte("start_time", startOfDay(startDate).getTime())
    .lte("start_time", endOfDay(endDate).getTime())
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
  gameSessions: GameSession[];
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
}: {
  sessionId: string;
  userId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "POST",
      headers: {
        token: session.access_token,
      },
    }
  )
    .then((response) => response.json())
    .catch((error) => {
      log({ error });
      throw error;
    });
  return data;
}

export async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "DELETE",
      headers: {
        token: session.access_token,
      },
    }
  )
    .then((response) => response.json())
    .catch((error) => {
      log({ error });
      throw error;
    });
  return data;
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
  const { error } = await supabase.from("sessions").update(update).eq("id", id);
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
