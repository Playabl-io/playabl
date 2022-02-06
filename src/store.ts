import { reactive } from "vue";
import { Community } from "./typings/Community";
import { AccessLevel } from "./typings/AccessLevel";
import { MemberWithMembership } from "./typings/Member";
import { RsvpWithUser } from "./typings/Rsvp";

interface StoreUser {
  id: string;
  email?: string;
  pronouns?: string;
}

interface Store {
  user?: StoreUser | null;
  communityInfo: Community | null;
  communityAccessLevels: AccessLevel[];
  communityMembers: MemberWithMembership[];
  communityMemberAccess: Record<string, { id: string; name: string }[]>;
  sessionRsvps: Record<string, RsvpWithUser[]>;
}

export const store = reactive<Store>({
  user: null,
  communityAccessLevels: [],
  communityInfo: null,
  communityMembers: [],
  communityMemberAccess: {},
  sessionRsvps: {},
});
