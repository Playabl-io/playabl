import { reactive } from "vue";
import { AccessLevel } from "./typings/AccessLevel";
import { Profile } from "./typings/Profile";
import { Notification } from "./typings/Notification";
import { Session } from "@supabase/gotrue-js";
import { Community } from "./typings/Community";

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
}

export const store = reactive<Store>({
  user: null,
  userSession: null,
  notifications: [],
  communityAccessLevels: [],
  communityMemberAccess: {},
  userEnabledFlags: {},
  userManagedCommunities: [],
});
