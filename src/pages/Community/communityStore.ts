import { AccessLevel } from "@/typings/AccessLevel";
import { Community } from "@/typings/Community";
import { Game } from "@/typings/Game";
import { Member, MemberWithMembership } from "@/typings/Member";
import Stripe from "stripe";
import { reactive } from "vue";

interface CommunityStore {
  coverImageUrl?: string;
  gamesCount: number;
  games: Game[];
  membersCount: number;
  members: MemberWithMembership[];
  isAdmin: boolean;
  isCreator: boolean;
  isPlayer: boolean;
  userRoleId: number;
  community: Community;
  admins: Member[];
  communityAccessLevels: AccessLevel[];
  prices?: Stripe.Price[];
  paymentLink?: Stripe.PaymentLink;
}

const DEFAULT_COMMUNITY_STATE: CommunityStore = {
  gamesCount: 0,
  games: [],
  membersCount: 0,
  members: [],
  isAdmin: false,
  isCreator: false,
  isPlayer: false,
  userRoleId: -1,
  community: {
    id: "",
    name: "",
    allow_public_signup: false,
    created_at: "",
  },
  admins: [],
  communityAccessLevels: [],
  prices: [],
};

export let communityStore = reactive<CommunityStore>({
  ...DEFAULT_COMMUNITY_STATE,
});

export function clearCommunityStore() {
  communityStore = reactive<CommunityStore>({
    ...DEFAULT_COMMUNITY_STATE,
  });
}
