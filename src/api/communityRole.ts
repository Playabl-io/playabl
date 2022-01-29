import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ROLES } from "@/util/roles";

export async function updateMemberRole({
  communityMembershipId,
  role,
}: {
  communityMembershipId: string;
  role: ROLES;
}) {
  const { data, error } = await supabase
    .from("community_memberships")
    .update({
      role_id: role,
    })
    .match({
      id: communityMembershipId,
    })
    .single();
  if (error) {
    log({ error });
  }
  return data;
}
