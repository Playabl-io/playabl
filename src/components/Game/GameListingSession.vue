<template>
  <div
    class="flex items-center gap-2 w-full border border-gray-100 p-2 rounded-md"
  >
    <div
      class="grid grid-cols-2 lg:grid-cols-3 gap-4 session-time-grid items-center w-full"
    >
      <p class="text-sm">
        {{ format(new Date(session.start_time), "EEE, MMM do") }}
      </p>
      <p class="text-sm">
        {{ format(new Date(session.start_time), "hh:mm aa") }} -
        {{ format(new Date(session.end_time), "hh:mm aa") }}
      </p>
      <div class="text-sm flex gap-1 items-center">
        <CheckCircleIcon
          v-if="session.rsvps.length < session.participant_count"
          class="text-green-500 w-4 h-4"
        />
        {{
          session.rsvps.length >= session.participant_count
            ? `${session.rsvps.length - session.participant_count} waitlisted`
            : "Seats available"
        }}
      </div>
    </div>

    <div class="ml-auto flex items-center gap-2 relative">
      <div
        v-if="isPlayingInGame"
        class="p-2 rounded-md bg-green-200 flex items-center space-x-1 shadow-sm"
      >
        <p class="text-sm font-semibold">RSVP'd</p>
        <StarIcon class="h-4 w-4 text-emerald-600" />
      </div>
      <div
        v-if="isWaitlisted"
        class="p-2 rounded-md bg-violet-200 flex items-center space-x-1 shadow-sm"
      >
        <p class="text-sm font-semibold">Waitlist</p>
        <ExclamationCircleIcon class="h-4 w-4 text-violet-600" />
      </div>
      <Menu>
        <MenuButton>
          <EllipsisHorizontalCircleIcon class="h-6 w-6" />
        </MenuButton>
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <MenuItems
            class="absolute -translate-x-full whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-white border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
          >
            <MenuItem v-if="canRsvp" v-slot="{ active }">
              <button
                class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                :class="{
                  'bg-gray-200': active,
                }"
                @click="emit('rsvp', session.id)"
              >
                RSVP to session
              </button>
            </MenuItem>
            <MenuItem
              v-slot="{ active }"
              class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
            >
              <router-link
                :to="`/games/${session.game_id}`"
                :class="{
                  'bg-gray-200': active,
                }"
              >
                View game
              </router-link>
            </MenuItem>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed } from "vue";
import { Session } from "@/typings/Session";
import { store } from "@/store";
import { format } from "date-fns";
import {
  StarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { userCanRsvp } from "@/util/time";

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["rsvp"]);

const playerIndex = computed(() => {
  if (!store.user?.id) return -1;
  const indexOfPlayer = props.session.rsvps.indexOf(store.user.id);
  return indexOfPlayer;
});
const isPlayingInGame = computed(
  () =>
    playerIndex.value > -1 &&
    playerIndex.value < props.session.participant_count,
);
const isWaitlisted = computed(
  () => playerIndex.value > props.session.participant_count - 1,
);

const canRsvp = computed(() =>
  userCanRsvp({
    userAccess: store.userCommunityAccess,
    session: props.session,
    userId: store.user?.id,
    hostId: props.creatorId,
  }),
);
</script>
<style scoped>
.session-time-grid {
  grid-template-columns: 1fr;
}
@media screen(lg) {
  .session-time-grid {
    grid-template-columns: 140px 1fr 150px;
  }
}
</style>
