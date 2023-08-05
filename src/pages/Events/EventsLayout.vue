<template>
  <DetailPageTemplate
    :routes="[
      {
        label: 'Overview',
        path: 'overview',
      },
      {
        label: 'Calendar',
        path: 'calendar',
      },
      {
        label: 'Manage',
        path: 'manage',
      },
    ]"
  >
    <div v-if="loading" class="grid place-content-center">
      <LoadingSpinner />
    </div>
    <template v-else-if="eventStore.event">
      <Heading level="h1">
        {{ eventStore.event?.title }}
      </Heading>
      <div class="mt-2">
        <router-link
          v-if="eventStore?.community"
          :to="`/communities/${
            eventStore.community.url_short_name || eventStore.community.id
          }`"
          class="text-xs text-slate-700"
        >
          Part of {{ eventStore.community.name }}
        </router-link>
      </div>
      <div class="mt-2 flex gap-2 text-sm font-semibold">
        {{ format(new Date(eventStore.event.start_time), "MMM do h:mm aa") }}
        —
        {{ format(new Date(eventStore.event.end_time), "MMM do h:mm aa") }}
      </div>
      <div class="mt-2 grid gap-2">
        <Popover v-if="accessModel.button" class="relative">
          <PopoverButton
            type="button"
            class="flex items-center gap-1 rounded-md focus-styles"
          >
            <UserCircleIcon class="w-5 h-5 text-blue-700" />
            <p
              class="text-sm text-blue-700 font-semibold border-b border-dashed border-blue-600"
            >
              {{ accessModel.button }}
            </p>
          </PopoverButton>

          <PopoverPanel
            class="absolute z-10 mt-2 bg-white p-4 rounded-md shadow-md border border-solid border-gray-100"
          >
            <p class="text-sm leading-relaxed">
              {{ accessModel.content }}
            </p>
          </PopoverPanel>
        </Popover>
      </div>
      <section class="mt-6">
        <router-view> </router-view>
      </section>
    </template>
  </DetailPageTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { loadEventAndCommunityByEventId } from "@/api/communityEvents";
import DetailPageTemplate from "@/layouts/DetailPageTemplate.vue";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { useRoute } from "vue-router";
import { eventStore } from "./eventStore";
import { communityEventSchema } from "./eventUtils";
import Heading from "@/components/Heading.vue";
import { loadAccessLevels } from "@/api/accessLevels";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { loadGamesAndSessionsForEvent } from "@/api/gamesAndSessions";
import { format } from "date-fns";
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { store } from "@/store";
import { getUserAccess } from "@/storeActions";
const route = useRoute();

const loading = ref(false);

const accessModel = computed(() => {
  if (!eventStore.event?.event_access_levels?.length) {
    return {};
  }
  console.log(store.userCommunityAccess);
  if (eventStore.event?.event_access_levels?.length > 0) {
    const userHasAccess = eventStore.event.event_access_levels.some((id) =>
      store.userCommunityAccess.find((policy) => policy.access_level_id === id)
    );
    if (userHasAccess) {
      return {
        button: "You have access",
        content: "You have access to RSVP to games and sessions in this event",
      };
    } else {
      return {
        button: "You do not have access",
        content:
          "This event requires access that hasn't been assigned to you by the community administrators",
      };
    }
  }
  return {
    button: "Open to all community members",
    content:
      "Access to games and sessions scheduled for this event are open to all community members",
  };
});

onMounted(async () => {
  const eventId = route.params.event_id;
  if (!eventId && !Number.isInteger(eventId)) {
    throw new Error("No valid event ID");
  }
  if (store.user?.id) {
    getUserAccess(store.user.id);
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
