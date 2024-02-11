import {
  loadAllUserAccess,
  loadCommunityAccessTimes,
} from "./api/communityAccess";
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

export async function triggerUserAccessLoad(id: string) {
  getUserAccess(id);
  getUserMemberships(id);
}

export async function getAccessLevels(
  communityId: string,
  preselectedLevels?: number[]
) {
  const data = await loadCommunityAccessTimes(communityId);
  if (data) {
    store.communityAccessLevels = data;
  }
  const mandatory = store.communityAccessLevels.reduce((acc, level) => {
    if (level.is_mandatory) {
      acc.push(level.id);
    }
    return acc;
  }, [] as number[]);
  return preselectedLevels
    ? [...new Set(mandatory.concat(preselectedLevels))]
    : mandatory;
}
