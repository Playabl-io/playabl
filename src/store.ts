import { reactive } from "vue";
import { AccessLevel } from "./typings/AccessLevel";
import { Profile } from "./typings/Profile";
import { Notification } from "./typings/Notification";

interface Store {
  user?: Profile | null;
  notifications: Notification[];
  communityAccessLevels: AccessLevel[];
  communityMemberAccess: Record<
    string,
    { id: AccessLevel["id"]; name: AccessLevel["name"] }[]
  >;
}

export const store = reactive<Store>({
  user: null,
  notifications: [],
  communityAccessLevels: [],
  communityMemberAccess: {},
});
