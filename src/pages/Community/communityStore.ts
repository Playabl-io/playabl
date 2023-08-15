import { AccessLevel } from "@/typings/AccessLevel";
import { Community, SignupMethods } from "@/typings/Community";
import { CommunityEvent } from "@/typings/CommunityEvent";
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
  membershipRequest?: {
    id: number;
  };
  communityEvents: CommunityEvent[];
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
    signup_method: SignupMethods.PRIVATE,
  },
  admins: [],
  communityAccessLevels: [],
  prices: [],
  communityEvents: [],
};

export let communityStore = reactive<CommunityStore>({
  ...DEFAULT_COMMUNITY_STATE,
});

export function clearCommunityStore() {
  communityStore = reactive<CommunityStore>({
    ...DEFAULT_COMMUNITY_STATE,
  });
}
