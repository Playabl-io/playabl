import { computed, reactive, watch } from "vue";
import { AccessLevel } from "./typings/AccessLevel";
import { Profile } from "./typings/Profile";
import { Notification } from "./typings/Notification";
import { Session } from "@supabase/gotrue-js";
import { Community } from "./typings/Community";
import { CommunityAccess } from "./typings/CommunityAccess";
import { CommunityMembership } from "./typings/CommunityMembership";
import { ROLES } from "./util/roles";

interface Store {
  user: Profile | null;
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
  userSettings: Profile["user_settings"];
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
  userSettings: {},
});

watch(
  () => store.userCommunityMembership,
  (newVal) => {
    const managedCommunities = Object.values(newVal).reduce((acc, cur) => {
      if (cur.communityMembership.role_id === ROLES.admin) {
        acc.push(cur.community);
      }
      return acc;
    }, [] as Community[]);
    store.userManagedCommunities = managedCommunities;
  },
);

export const userCommunityMembershipIds = computed(() =>
  Object.values(store.userCommunityMembership).reduce(
    (acc, cur) => {
      acc.push(cur.community.id);
      return acc;
    },
    [] as Community["id"][],
  ),
);
