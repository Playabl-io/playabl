import { Handler } from "@netlify/functions";
import { authenticateUser, supabase, logError } from "../utils";
import * as R from "ramda";
import { addDays, endOfDay } from "date-fns";

const SESSION_WITH_GAME_AND_COMMUNITY_INFO =
  "*, game_id(*, community_events(*), sessions(*), community_id(*))";

export const handler: Handler = async (event) => {
  const today = new Date();
  const sevenDaysFromNow = endOfDay(addDays(today, 7));

  const user = await authenticateUser(event);
  // load open games in next 7 days
  const { data: openGames, error: openGamesError } = await supabase
    .from("sessions")
    .select(SESSION_WITH_GAME_AND_COMMUNITY_INFO)
    .is("deleted_at", null)
    .gte("start_time", today.getTime())
    .lte("end_time", sevenDaysFromNow.getTime())
    .in("has_openings", [true])
    .order("start_time", { ascending: true });

  if (openGamesError) {
    logError(openGamesError);
  }
  if (!user) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        games: mapToAscSessions(openGames),
      }),
    };
  }

  const { data: communityMemberships, error: memberError } = await supabase
    .from("community_memberships")
    .select("communities!inner(*)")
    .is("communities.deleted_at", null)
    .eq("user_id", user.data.user.id);

  if (memberError) {
    logError(memberError);
  }

  const communityIds = communityMemberships.map(
    ({ communities }) => communities.id,
  );

  // load sessions playing in next 7 days
  const { data: playing, error: playingError } = await supabase
    .from("sessions")
    .select(SESSION_WITH_GAME_AND_COMMUNITY_INFO)
    .is("deleted_at", null)
    .contains("rsvps", [user.data.user.id])
    .gte("start_time", today.getTime())
    .lte("end_time", sevenDaysFromNow.getTime())
    .order("start_time", { ascending: true });

  if (playingError) {
    logError(playingError);
  }

  // load sessions managing in next 7 days
  const { data: managing, error: managingError } = await supabase
    .from("sessions")
    .select(SESSION_WITH_GAME_AND_COMMUNITY_INFO)
    .is("deleted_at", null)
    .eq("creator_id", user.data.user.id)
    .gte("start_time", today.getTime())
    .lte("end_time", sevenDaysFromNow.getTime())
    .order("start_time", { ascending: true });

  if (managingError) {
    // logError(gamesError);
  }

  // load info about facilitators they're playing with
  const uniqueCreators = new Set(playing.map((session) => session.creator_id));
  const allPlayers = [
    ...playing.flatMap((session) => session.rsvps),
    ...managing.flatMap((session) => session.rsvps),
  ].filter(Boolean);
  const uniquePlayers = new Set(allPlayers);

  const { data: playerProfiles, error: playerProfilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [...uniquePlayers]);

  if (playerProfilesError) {
    //
  }

  const { data: facilitatorProfiles, error: facilitatorProfilesError } =
    await supabase
      .from("profiles")
      .select("*")
      .in("id", [...uniqueCreators]);

  if (facilitatorProfilesError) {
    logError(facilitatorProfilesError);
  }

  const playerHistory: Record<
    string,
    { sessions: unknown[]; uniqueGamesCount: number }
  > = {};

  const allPeople = [...playerProfiles, ...facilitatorProfiles];
  const withoutUser = allPeople.filter(({ id }) => id !== user.data.user.id);

  for (const player of withoutUser) {
    const jointSessions = await loadJointSessions(user.data.user.id, player.id);
    const sessionsWithUserAsGM = await loadManagedSessions(
      user.data.user.id,
      player.id,
    );
    const sessionsWithPlayerAsGM = await loadPastPlayedGames(
      user.data.user.id,
      player.id,
    );
    const uniqByGame = R.uniqBy(
      (s) => s.game_id.title,
      [...jointSessions, ...sessionsWithUserAsGM, ...sessionsWithPlayerAsGM],
    );
    playerHistory[player.id] = {
      jointSessions,
      sessionsWithUserAsGM,
      sessionsWithPlayerAsGM,
      uniqueGamesCount: uniqByGame.length,
      uniqueGamesList: uniqByGame.map((session) => session.game_id.title),
      ...player,
    };
  }

  // load open games in next 7 days
  const { data: games, error: gamesError } = await supabase
    .from("sessions")
    .select(SESSION_WITH_GAME_AND_COMMUNITY_INFO)
    .is("deleted_at", null)
    .neq("creator_id", user.data.user.id)
    .in("community_id", communityIds)
    .gte("start_time", today.getTime())
    .lte("end_time", sevenDaysFromNow.getTime())
    .in("has_openings", [true])
    .order("start_time", { ascending: true });

  if (gamesError) {
    logError(gamesError);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      playing: mapToAscSessions(playing),
      managing: mapToAscSessions(managing),
      games:
        games.length > 0
          ? mapToAscSessions(games)
          : mapToAscSessions(openGames),
      playerHistory,
    }),
  };
};

async function loadJointSessions(userA: string, userB: string) {
  const users = [userA, userB];
  const { data, error } = await supabase
    .from("sessions")
    .select("*, game_id(title, id)")
    .is("deleted_at", null)
    .contains("rsvps", users)
    .order("start_time");

  if (error) {
    logError(error);
  }

  return data?.filter((session) => {
    return (
      users.every(
        (user) => session.rsvps.indexOf(user) < session.participant_count,
      ) ?? []
    );
  });
}

async function loadManagedSessions(dashboardUser: string, userB: string) {
  const users = [userB];
  const { data, error } = await supabase
    .from("sessions")
    .select("*, game_id(title, id)")
    .is("deleted_at", null)
    .eq("creator_id", dashboardUser)
    .contains("rsvps", users)
    .order("start_time");

  if (error) {
    logError(error);
  }

  return data?.filter((session) => {
    return (
      users.every(
        (user) => session.rsvps.indexOf(user) < session.participant_count,
      ) ?? []
    );
  });
}

async function loadPastPlayedGames(player: string, gm: string) {
  const users = [player];
  const { data, error } = await supabase
    .from("sessions")
    .select("*, game_id(title, id)")
    .is("deleted_at", null)
    .eq("creator_id", gm)
    .contains("rsvps", users)
    .order("start_time", { ascending: true });

  if (error) {
    logError(error);
  }

  return data?.filter((session) => {
    return (
      users.every(
        (user) => session.rsvps.indexOf(user) < session.participant_count,
      ) ?? []
    );
  });
}

// helper functions taken based on gamesAndSessions.ts
const sortSessionByTimeAsc = (a, b) => {
  if (a.start_time < b.start_time) return -1;
  if (a.start_time > b.start_time) return 1;
  return 0;
};
const sortInnerSessions = (session) => {
  return {
    ...session,
    game_id: {
      ...session.game_id,
      sessions: session.game_id.sessions.sort(sortSessionByTimeAsc),
    },
  };
};
const mapToAscSessions = R.map(sortInnerSessions);
