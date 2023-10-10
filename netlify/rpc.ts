import { supabase, logError } from "./utils";

export async function cancelGame(gameId: string) {
  const { error } = await supabase.rpc("cancel_game", {
    game_id: gameId,
  });
  if (error) {
    await logError({ message: JSON.stringify(error) });
    throw error;
  }
}

export async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const { data, error } = await supabase.rpc("leave_session", {
    user_id: userId,
    session_id: Number(sessionId),
  });
  if (error) {
    await logError({ message: JSON.stringify(error) });
    throw error;
  }
  return data;
}

export async function joinSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const { error, status } = await supabase.rpc("join_session", {
    user_id: userId,
    session_id: Number(sessionId),
  });
  if (error) {
    await logError({ message: JSON.stringify(error) });
  }
  return { error, status };
}
