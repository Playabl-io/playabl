import { loadAllUserAccess } from "./api/communityAccess";
import { loadUserCommunities } from "./api/communityMemberships";
import { store } from "./store";

export async function getUserMemberships(id: string) {
  const data = await loadUserCommunities({ userId: id });
  if (data) {
    const result = data.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.communityId]: cur,
      };
    }, {});
    store.userCommunityMembership = result;
  }
}

export async function getUserAccess(id: string) {
  const data = await loadAllUserAccess({ userId: id });
  if (data) {
    store.userCommunityAccess = data;
  }
}
