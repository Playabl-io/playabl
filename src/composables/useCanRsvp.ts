import { store } from "../store";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { getSoonestRsvpTime, userCanRsvp } from "@/util/time";
import { gameStore } from "@/pages/Game/gameStore";
import { Session } from "@/typings/Session";
import { formatDistance, formatRelative } from "date-fns/esm";

export function useCanRsvp({ session }: { session: Session }) {
  const canRsvp = ref(false);
  const compareDate = ref(new Date());
  const interval = ref<NodeJS.Timeout>();

  const runCheck = () => {
    compareDate.value = new Date();
    const membership =
      store.userCommunityMembership?.[gameStore.game.community_id];
    if (membership && membership.communityMembership.role_id > 0) {
      const result = userCanRsvp({
        userAccess: store.userCommunityAccess,
        session,
        hostId: gameStore.game.creator_id,
        userId: store.user?.id,
      });
      canRsvp.value = result;
    } else {
      canRsvp.value = false;
    }
  };

  onMounted(() => {
    runCheck();
    interval.value = setInterval(runCheck, 1000);
  });

  onUnmounted(() => {
    window.clearInterval(interval.value);
  });

  const soonestRsvp = computed(() => {
    let accessTimes;
    if (typeof session.access_times === "string") {
      accessTimes = JSON.parse(session.access_times);
    } else {
      accessTimes = session.access_times;
    }
    const membership =
      store.userCommunityMembership?.[gameStore.game.community_id];

    const allowDefault =
      membership && membership.communityMembership.role_id > 0;
    return getSoonestRsvpTime(
      store.userCommunityAccess,
      accessTimes,
      allowDefault,
    );
  });

  const accessNeeded = computed(() => {
    let accessTimes;
    if (typeof session.access_times === "string") {
      accessTimes = JSON.parse(session.access_times);
    } else {
      accessTimes = session.access_times;
    }
    const accessTimeNames: string[] = [];
    for (const access in accessTimes) {
      accessTimeNames.push(accessTimes[access].name);
    }
    return accessTimeNames;
  });

  const rsvpAvailableMessage = computed(() =>
    soonestRsvp.value
      ? `RSVP available ${formatRelative(soonestRsvp.value, compareDate.value)}`
      : "You do not have access to RSVP",
  );

  const timeTillRsvp = computed(() =>
    soonestRsvp.value
      ? formatDistance(soonestRsvp.value, compareDate.value, {
          includeSeconds: true,
        })
      : "",
  );

  return {
    canRsvp,
    accessNeeded,
    soonestRsvp,
    rsvpAvailableMessage,
    timeTillRsvp,
  };
}
