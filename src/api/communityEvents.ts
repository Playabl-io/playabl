import {
  CommunityEvent,
  CommunityEventInsert,
  CommunityEventWithCommunity,
} from "@/typings/CommunityEvent";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import {
  translateSortToSupabase,
  SORT_KEY,
  SORT_DIR,
  sortKeys,
  sortDirs,
} from "@/util/urlParams";
import client from "./client";

export async function getUpcomingCommunityEvents({
  id,
  sortKey = sortKeys.startTime,
  sortDir = sortDirs.asc,
  draftState = ["PUBLISHED"],
}: {
  id: CommunityEvent["community_id"];
  sortKey?: SORT_KEY;
  sortDir?: SORT_DIR;
  draftState?: CommunityEvent["draft_state"][];
}): Promise<CommunityEventWithCommunity[]> {
  const { data, error } = await supabase
    .from("community_events")
    .select("*, communities (*)")
    .eq("community_id", id)
    .in("draft_state", draftState)
    .is("deleted_at", null)
    .gte("end_time", new Date().getTime())
    .order(
      ...translateSortToSupabase({
        sortKey,
        sortDir,
      })
    );

  if (error) {
    log({
      error,
    });
  }

  return data ?? [];
}

const defaultEventSearchOptions: {
  sortKey: SORT_KEY;
  sortDir: SORT_DIR;
  draftState: CommunityEvent["draft_state"][];
} = {
  sortKey: sortKeys.startTime,
  sortDir: sortDirs.asc,
  draftState: ["PUBLISHED"],
};

export async function getEvents({
  sortKey = sortKeys.startTime,
  sortDir = sortDirs.asc,
  draftState = ["PUBLISHED"],
}: {
  sortKey?: SORT_KEY;
  sortDir?: SORT_DIR;
  draftState: CommunityEvent["draft_state"][];
} = defaultEventSearchOptions): Promise<CommunityEventWithCommunity[]> {
  const { data, error } = await supabase
    .from("community_events")
    .select("*, communities (*)")
    .in("draft_state", draftState)
    .is("deleted_at", null)
    .gte("end_time", new Date().getTime())
    .order(
      ...translateSortToSupabase({
        sortKey,
        sortDir,
      })
    );
  if (error) {
    log({
      error,
    });
  }

  return data ?? [];
}

export function createCommunityEvent(event: CommunityEventInsert) {
  return client.post("/.netlify/functions/createCommunityEvent", event);
}

export function updateCommunityEvent(event: CommunityEventInsert) {
  return client.post("/.netlify/functions/updateCommunityEvent", event);
}

export function publishCommunityEvent(eventId: CommunityEvent["id"]) {
  return client.post(
    `/.netlify/functions/publishCommunityEvent?event_id=${eventId}`
  );
}

export function cancelCommunityEvent(eventId: CommunityEvent["id"]) {
  return client.delete(
    `/.netlify/functions/cancelCommunityEvent?event_id=${eventId}`
  );
}

export async function loadEventAndCommunityByEventId(
  eventId: CommunityEvent["id"]
) {
  const { data, error } = await supabase
    .from("community_events")
    .select("*, communities (*)")
    .eq("id", eventId)
    .single();
  if (error) {
    log({
      error,
    });
  }
  return data;
}
