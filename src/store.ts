import { reactive } from "vue";
import { Community } from "./typings/Community";
import { AccessLevel } from "./typings/AccessLevel";

interface StoreUser {
  id: string;
  email?: string;
  pronouns?: string;
}

/**
 * Set and used when managing a community
 */
interface StoreCommunity {
  communityInfo: Community | null;
  communityAccessLevels: AccessLevel[];
}

interface Store {
  user?: StoreUser | null;
  community: StoreCommunity;
}

export const store = reactive<Store>({
  user: null,
  community: {
    communityAccessLevels: [],
    communityInfo: null,
  },
});
