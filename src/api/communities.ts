import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";

export async function loadJoinedCommunities() {
  if (!store.user) return;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id (*)")
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    return data.map((membership) => ({
      ...membership.community_id,
    }));
  }
}

export async function loadJoinedCommunityIds(): Promise<
  { community_id: string }[] | undefined
> {
  if (!store.user) return;
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id")
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}
