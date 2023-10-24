<template>
  <template v-if="eventStore.event">
    <div
      v-if="eventStore.event?.draft_state === 'DRAFT' && isCreatorOrAdmin"
      class="border border-blue-500 rounded-md p-4 bg-blue-100 prose-sm mb-6"
    >
      <p class="font-semibold">This event is not published</p>
      <p>
        This event is not published yet. You can add games and update details,
        but the event and its games are not findable in results.
      </p>
      <p v-if="isAdmin">
        When you're ready you can publish the event from the
        <RouterLink
          :to="`/events/${eventStore.event.id}/manage`"
          class="text-blue-900 underline"
        >
          Manage area
        </RouterLink>
      </p>
    </div>
    <Heading level="h1">
      {{ eventStore.event?.title }}
    </Heading>
    <div class="mt-2">
      <router-link
        v-if="eventStore?.community"
        :to="`/communities/${
          eventStore.community.url_short_name || eventStore.community.id
        }`"
        class="text-sm text-slate-700"
      >
        Hosted by {{ eventStore.community.name }}
      </router-link>
    </div>
    <div class="mt-2 flex gap-2 text-sm font-semibold">
      {{ format(new Date(eventStore.event.start_time), "MMM do h:mm aa") }}
      —
      {{ format(new Date(eventStore.event.end_time), "MMM do h:mm aa") }}
    </div>
    <div v-if="eventStore.event.fixed_access_time" class="mt-2 text-sm">
      RSVPs open
      {{
        format(new Date(eventStore.event.fixed_access_time), "MMM do h:mm aa")
      }}
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
    <div class="flex justify-between items-end my-6">
      <div>
        <Heading level="h6">Upcoming Games</Heading>
        <RouterLink
          :to="`/events/${eventStore.event.id}/calendar?date=${format(
            new Date(eventStore.event.start_time),
            'yyyy-MM',
          )}`"
          class="text-sm text-blue-700 underline mt-2"
          >or browse the event calendar</RouterLink
        >
      </div>
      <PrimaryButton
        v-if="isCreatorOrAdmin"
        :to="`/games/new?event_id=${eventStore.event?.id}&community_id=${eventStore.event?.community_id}`"
        >Add Game to Event</PrimaryButton
      >
    </div>

    <swiper-container
      :modules="[Pagination]"
      :slides-per-view="1"
      :breakpoints="{
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      }"
      :pagination="{
        type: 'bullets',
        clickable: true,
        dynamicBullets: true,
        grabCursor: true,
        centeredSlides: true,
      }"
    >
      <swiper-slide v-for="game in eventStore.eventGames" :key="game.id">
        <EventGameItem :game="game" />
      </swiper-slide>
    </swiper-container>

    <div>
      <div v-if="eventStore.event?.description">
        <Heading level="h6" class="mt-6 mb-2">Details</Heading>
        <Well class="bg-white">
          <TipTapDisplay :content="eventStore.event.description" />
        </Well>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import { computed } from "vue";
import Heading from "@/components/Heading.vue";
import { eventStore } from "./eventStore";
import EventGameItem from "./EventGameItem.vue";
import Well from "@/components/Well.vue";
import TipTapDisplay from "@/components/TipTapDisplay.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { store } from "@/store";
import { format } from "date-fns";
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { ROLES } from "@/util/roles";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const role = computed(() => {
  if (!eventStore.event?.community_id) {
    return ROLES.player;
  }
  return store.userCommunityMembership[eventStore.event.community_id]
    ?.communityMembership.role_id;
});

const isAdmin = computed(() => role.value === ROLES.admin);

const isCreatorOrAdmin = computed(() => {
  return isAdmin.value || role.value === ROLES.creator;
});

const accessModel = computed(() => {
  if (!eventStore.event) {
    return {};
  }
  if (
    eventStore.event?.event_access_levels?.length &&
    eventStore.event?.event_access_levels?.length > 0
  ) {
    const userHasAccess = eventStore.event.event_access_levels.some((id) =>
      store.userCommunityAccess.find((policy) => policy.access_level_id === id),
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
</script>
