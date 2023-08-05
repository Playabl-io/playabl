import { reactive } from "vue";
import { AccessLevel } from "./typings/AccessLevel";
import { Profile } from "./typings/Profile";
import { Notification } from "./typings/Notification";
import { Session } from "@supabase/gotrue-js";
import { Community } from "./typings/Community";
import { CommunityAccess } from "./typings/CommunityAccess";
import { CommunityMembership } from "./typings/CommunityMembership";

interface Store {
  user?: Profile | null;
  userSession?: Session | null;
  notifications: Notification[];
  communityAccessLevels: AccessLevel[];
  communityMemberAccess: Record<
    string,
    { id: AccessLevel["id"]; name: AccessLevel["name"] }[]
  >;
  userEnabledFlags: Record<string, boolean>;
  userManagedCommunities: Community[];
  userCommunityAccess: CommunityAccess[];
  userCommunityMembership: Record<
    string,
    {
      communityId: Community["id"];
      community: Community;
      communityMembership: CommunityMembership;
    }
  >;
}

export const store = reactive<Store>({
  user: null,
  userSession: null,
  notifications: [],
  communityAccessLevels: [],
  communityMemberAccess: {},
  userEnabledFlags: {},
  userManagedCommunities: [],
  userCommunityAccess: [],
  userCommunityMembership: {},
});
