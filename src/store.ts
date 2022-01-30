import { reactive } from "vue";
import { Community } from "./typings/Community";
import { AccessLevel } from "./typings/AccessLevel";

interface StoreUser {
  id: string;
  email?: string;
  pronouns?: string;
}

interface Store {
  user?: StoreUser | null;
  communityInfo: Community | null;
  communityAccessLevels: AccessLevel[];
}

export const store = reactive<Store>({
  user: null,
  communityAccessLevels: [],
  communityInfo: null,
});
