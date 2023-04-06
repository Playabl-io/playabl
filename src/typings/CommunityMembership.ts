import { ROLES } from "@/util/roles";

export interface CommunityMembership {
  id: string;
  created_at: string;
  community_id: string;
  role_id: ROLES;
  user_id: string;
}

export interface CommunityMembershipRequest {
  id: number;
  created_at: string;
  community_id: string;
  user_id: string;
  message: string;
}
