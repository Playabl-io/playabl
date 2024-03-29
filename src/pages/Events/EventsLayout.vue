<template>
  <DetailPageTemplate :routes="routes">
    <div v-if="loading" class="grid place-content-center">
      <LoadingSpinner />
    </div>
    <template v-else-if="eventStore.event">
      <div v-if="isCancelled" class="bg-rose-100 text-rose-900 rounded-md p-4">
        <p>
          This event has been cancelled along with its games and sessions.
          Please contact the community admins with any questions.
        </p>
      </div>
      <section class="mt-6">
        <router-view> </router-view>
      </section>
    </template>
  </DetailPageTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed } from "vue";
import { format } from "date-fns";
import { loadEventAndCommunityByEventId } from "@/api/communityEvents";
import DetailPageTemplate from "@/layouts/DetailPageTemplate.vue";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { useRoute } from "vue-router";
import { eventStore, clearEventStore } from "./eventStore";
import { communityEventSchema } from "./eventUtils";
import { loadAccessLevels } from "@/api/accessLevels";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { loadGamesAndSessionsForEvent } from "@/api/gamesAndSessions";
import { store } from "@/store";
import { ROLES } from "@/util/roles";
const route = useRoute();

const loading = ref(false);

const isCancelled = computed(() => eventStore.event?.deleted_at);
const isAdmin = computed(() => {
  if (!eventStore.event?.community_id) {
    return false;
  }
  return (
    store.userCommunityMembership[eventStore.event.community_id]
      ?.communityMembership.role_id === ROLES.admin
  );
});
const routes = computed(() => {
  if (!eventStore.event) {
    return [
      {
        label: "Overview",
        path: "overview",
      },
    ];
  }

  const result = [
    {
      label: "Overview",
      path: "overview",
    },
  ];
  if (isCancelled.value) {
    return result;
  }
  const eventBrowseDate = format(
    new Date(eventStore.event.start_time),
    "yyyy-MM"
  );
  result.push({
    label: "Calendar",
    path: `calendar?date=${eventBrowseDate}`,
  });
  if (isAdmin.value) {
    result.push({
      label: "Manage",
      path: "manage",
    });
  }
  return result;
});

onMounted(async () => {
  const eventId = route.params.event_id;
  if (!eventId && !Number.isInteger(eventId)) {
    throw new Error("No valid event ID");
  }
  loading.value = true;
  const event = await loadEvent(Number(eventId));
  if (event) {
    await Promise.all([
      loadEventAccessPolicies(event.event_access_levels),
      loadEventGamesAndSessions(event.id),
    ]);
  }
  loading.value = false;
});

onUnmounted(clearEventStore);

async function loadEvent(eventId: CommunityEvent["id"]) {
  const result = await loadEventAndCommunityByEventId(eventId);
  if (result) {
    const community = result.communities;
    eventStore.community = community;
    try {
      const event = communityEventSchema.parse(result);
      eventStore.event = event;
      return event;
    } catch (error) {
      console.log(error);
    }
  }
}

async function loadEventAccessPolicies(ids: number[] | null) {
  if (!ids) return;
  const result = await loadAccessLevels({ accessLevelIds: ids });
  if (result) {
    eventStore.eventAccessPolicies = result;
  }
}

async function loadEventGamesAndSessions(eventId: number) {
  const result = await loadGamesAndSessionsForEvent(eventId);
  eventStore.eventGames = result;
}
</script>
