import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ROLES } from "@/util/roles";

export async function updateMemberRole({
  communityMembershipId,
  roleId,
}: {
  communityMembershipId: string;
  roleId: ROLES;
}) {
  const { data, error } = await supabase
    .from("community_memberships")
    .update({
      role_id: roleId,
    })
    .eq("id", communityMembershipId)
    .select()
    .single();
  if (error) {
    log({ error });
  }
  return data;
}
