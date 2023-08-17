import {
  CommunityEvent,
  CommunityEventInsert,
  CommunityEventWithCommunity,
} from "@/typings/CommunityEvent";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { SORT_QUERY_VALUES, translateSortToSupabase } from "@/util/urlParams";
import client from "./client";

const defaultEventSearchOptions = {
  sort: SORT_QUERY_VALUES.startTimeAsc,
  draftState: ["PUBLISHED"],
};

export async function getUpcomingCommunityEvents({
  id,
  sort = SORT_QUERY_VALUES.startTimeAsc,
  draftState = ["PUBLISHED"],
}: {
  id: CommunityEvent["community_id"];
  sort?: SORT_QUERY_VALUES;
  draftState?: CommunityEvent["draft_state"][];
}): Promise<CommunityEventWithCommunity[]> {
  const { data, error } = await supabase
    .from("community_events")
    .select("*, communities (*)")
    .eq("community_id", id)
    .in("draft_state", draftState)
    .is("deleted_at", null)
    .gte("end_time", new Date().getTime())
    .order(...translateSortToSupabase(sort));

  if (error) {
    log({
      error,
    });
  }

  return data ?? [];
}

export async function getEvents({
  sort = SORT_QUERY_VALUES.startTimeAsc,
  draftState = ["PUBLISHED"],
}: {
  sort?: SORT_QUERY_VALUES;
  draftState: CommunityEvent["draft_state"][];
} = defaultEventSearchOptions): Promise<CommunityEventWithCommunity[]> {
  const { data, error } = await supabase
    .from("community_events")
    .select("*, communities (*)")
    .in("draft_state", draftState)
    .is("deleted_at", null)
    .gte("end_time", new Date().getTime())
    .order(...translateSortToSupabase(sort));
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
  return client.delete(
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
