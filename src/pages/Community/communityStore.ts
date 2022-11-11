import { supabase } from "@/supabase";
import { AccessLevel } from "@/typings/AccessLevel";
import { Community } from "@/typings/Community";
import { Game } from "@/typings/Game";
import { Member, MemberWithMembership } from "@/typings/Member";
import { log } from "@/util/logger";
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

export async function getMemberCount(communityId: string) {
  const { error, count } = await supabase
    .from("community_memberships")
    .select("*", { count: "estimated" })
    .eq("community_id", communityId);
  if (count !== null) {
    communityStore.membersCount = count;
  }
  if (error) {
    log({ error });
  }
}
