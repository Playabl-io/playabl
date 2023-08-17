<template>
  <BrowsePageTemplate
    title="Event"
    :allow-create-new="allowAdminActions"
    @create-new="
      router.push({
        path: '/events/new',
        query: {
          community_id: route.params.community_id,
        },
      })
    "
  >
    <template #page-controls>
      <UrlSortDropdown />
      <div v-if="allowAdminActions">
        <FormLabel> Draft State </FormLabel>
        <FormLabel no-margin class="flex mt-3">
          <FormCheckbox v-model="draftStates" value="DRAFT" />
          Draft
        </FormLabel>
        <FormLabel no-margin class="flex mt-2">
          <FormCheckbox v-model="draftStates" value="PUBLISHED" />
          Published
        </FormLabel>
      </div>
    </template>
    <template #content>
      <LoadingSpinner v-if="loading" color="brand-500" />
      <div v-else class="grid gap-6">
        <div
          v-if="activeEvents.length === 0"
          class="grid place-items-center relative"
        >
          <p class="md:font-lg font-semibold text-center pt-12">
            Keep searching, explorer. The results you're looking for aren't
            here.
          </p>
          <img
            src="/searching.png"
            alt=""
            width="100%"
            height="100%"
            class="w-full object-contain relative -top-4"
          />
        </div>
        <RouterLink
          v-for="event in activeEvents"
          :key="event.id"
          :to="`/events/${event.id}`"
        >
          <Well class="hover:shadow-md">
            <div class="flex justify-between items-start mb-4">
              <div>
                <Heading level="h6">
                  {{ event.title }}
                </Heading>
                <p class="text-sm">{{ event.communities.name }}</p>
              </div>
              <ColorTag
                v-if="allowAdminActions"
                :variant="event.draft_state === 'DRAFT' ? 'purple' : 'green'"
              >
                {{ event.draft_state }}
              </ColorTag>
            </div>
            <div class="flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-slate-700" />
              <p class="text-slate-700 font-semibold">
                {{ format(new Date(event.start_time), "MMM do, hh:mm a") }}
              </p>
            </div>
            <div
              class="line-clamp-6 prose mt-6 force-clamp"
              v-html="event.description"
            />
          </Well>
        </RouterLink>
      </div>
    </template>
  </BrowsePageTemplate>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import Heading from "@/components/Heading.vue";
import { getUpcomingCommunityEvents, getEvents } from "@/api/communityEvents";
import { communityStore } from "./communityStore";
import { CalendarIcon } from "@heroicons/vue/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  CommunityEvent,
  CommunityEventWithCommunity,
} from "@/typings/CommunityEvent";
import Well from "@/components/Well.vue";
import { format } from "date-fns";
import ColorTag from "@/components/ColorTag.vue";
import BrowsePageTemplate from "@/layouts/BrowsePageTemplate.vue";
import UrlSortDropdown from "@/components/Search/UrlSortDropdown.vue";
import { useRoute, useRouter } from "vue-router";
import { store } from "@/store";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import { SORT_QUERY_VALUES } from "@/util/urlParams";

const route = useRoute();
const router = useRouter();

const activeEvents = ref<CommunityEventWithCommunity[]>([]);
const loading = ref(false);

const draftStates = ref<CommunityEvent["draft_state"][]>(
  Array.isArray(route.query.draft_state)
    ? route.query.draft_state
    : [route.query.draft_state || "PUBLISHED"]
);

const allowAdminActions = computed(() => {
  if (route.params.community_id) {
    return communityStore.isAdmin;
  }
  return store.userManagedCommunities.length > 0;
});
async function loadEvents() {
  loading.value = true;
  if (route.params.community_id) {
    const data = await getUpcomingCommunityEvents({
      id: communityStore.community.id,
      sort: route.query.sort as SORT_QUERY_VALUES,
      draftState: draftStates.value,
    });
    activeEvents.value = data;
  } else {
    const data = await getEvents({
      sort: route.query.sort as SORT_QUERY_VALUES,
      draftState: draftStates.value,
    });
    activeEvents.value = data;
  }
  loading.value = false;
}
onMounted(loadEvents);
watch([route, draftStates], () => {
  loadEvents();
});
</script>
<style>
.force-clamp p {
  display: inline;
}
</style>
