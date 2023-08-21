import { Database } from "@/typings/supabase";
import { Community } from "./Community";

export type CommunityEvent =
  Database["public"]["Tables"]["community_events"]["Row"];
export type CommunityEventUpdate =
  Database["public"]["Tables"]["community_events"]["Update"];
export type CommunityEventInsert =
  Database["public"]["Tables"]["community_events"]["Insert"];
export type CommunityEventRelationship =
  Database["public"]["Tables"]["community_events"]["Relationships"];

export type CommunityEventWithCommunity = CommunityEvent & {
  communities: Community;
};
