import { reactive } from "vue";
import { AccessLevel } from "./typings/AccessLevel";
import { Profile } from "./typings/Profile";

interface Store {
  user?: Profile | null;
  communityAccessLevels: AccessLevel[];
  communityMemberAccess: Record<
    string,
    { id: AccessLevel["id"]; name: AccessLevel["name"] }[]
  >;
}

export const store = reactive<Store>({
  user: null,
  communityAccessLevels: [],
  communityMemberAccess: {},
});
