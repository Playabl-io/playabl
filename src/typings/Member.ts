export interface Member {
  id: string;
  updated_at: string;
  username: string;
  avatar_url?: string;
  pronouns: string;
  website?: string;
  twitter?: string;
  bio?: string;
}

export type NewMember = Omit<Member, "id" | "updated_at">;

export type MemberWithMembership = Member & {
  role: string;
  access: { name: string; id: string; userId: string }[];
  membershipId: string;
};
