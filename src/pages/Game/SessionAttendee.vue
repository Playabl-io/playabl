<template>
  <li class="py-4">
    <div v-if="gameStore.attendees[id]" class="flex items-center gap-4">
      <UserAvatar
        :username="display"
        :avatar-url="gameStore.attendees[id].avatar_url"
        size="regular"
      />
      <div class="flex flex-col">
        <div class="flex items-center gap-1">
          <p>
            {{ display }}
          </p>
          <p
            v-if="gameStore.attendees[id].pronouns"
            class="text-sm text-slate-700"
          >
            ({{ gameStore.attendees[id].pronouns }})
          </p>
        </div>
        <p v-if="isOwner" class="mt-1 text-sm">
          {{ gameStore.attendees[id].email }}
        </p>
      </div>
      <div v-if="isOwner" class="ml-auto relative">
        <Menu>
          <MenuButton>
            <EllipsisHorizontalCircleIcon class="h-6 w-6 ml-auto" />
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
              class="absolute -translate-x-3/4 whitespace-nowrap text-sm flex flex-col items-stetch gap-2 bg-white border border-solid border-gray-200 border-opacity-70 rounded-lg text-slate-900 p-2 z-20 shadow-xl"
            >
              <MenuItem v-slot="{ active }">
                <button
                  class="p-2 text-left hover:bg-gray-200 hover:bg-opacity-50 rounded-md"
                  :class="{
                    'bg-gray-200': active,
                  }"
                  @click="emit('removeUser', id)"
                >
                  Remove from session
                </button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
    <LoadingSpinner v-else color="brand-500" />
  </li>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { gameStore } from "./gameStore";
import UserAvatar from "@/components/UserAvatar.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["removeUser"]);

const display = computed(() => {
  return (
    gameStore.attendees[props.id].username ||
    `${gameStore.attendees[props.id].email.slice(0, 5)}....`
  );
});
</script>
