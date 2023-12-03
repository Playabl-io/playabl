<template>
  <div class="border border-solid border-gray-300 rounded-lg focus-styles">
    <RouterLink v-if="coverImageUrl" :to="`/games/${game.id}`">
      <div
        class="w-full relative"
        :class="{
          'aspect-w-16 aspect-h-9': coverImageUrl,
        }"
      >
        <img
          class="w-full h-full object-center object-cover rounded-t-lg"
          :src="coverImageUrl"
          alt="image"
          loading="lazy"
        />
      </div>
    </RouterLink>
    <div class="p-4 rounded-b-lg">
      <p
        v-if="game.deleted_at"
        class="mb-2 p-2 rounded-xl bg-red-700 text-white w-min"
      >
        Cancelled
      </p>
      <RouterLink :to="`/games/${game.id}`">
        <Heading as="h6" level="h6">{{ game.title }} </Heading>
      </RouterLink>
      <RouterLink :to="`/communities/${game.community_id.id}`">
        <p class="text-xs text-slate-700 mt-1">{{ game.community_id.name }}</p>
      </RouterLink>

      <Disclosure v-slot="{ open }">
        <DisclosureButton
          class="w-full mt-2 p-4 bg-violet-100 text-brand-500 text-left rounded-lg flex justify-between"
        >
          <slot name="sessions-title">
            {{ game.sessions.length }} upcoming
            {{
              pluralize({ count: game.sessions.length, singular: "session" })
            }}
          </slot>
          <component
            :is="open ? ChevronDownIcon : ChevronUpIcon"
            class="h-5 w-5"
          />
        </DisclosureButton>
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform opacity-0"
          enter-to-class="transform opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform opacity-100"
          leave-to-class="transform opacity-0"
        >
          <DisclosurePanel class="p-2 flex flex-col gap-3">
            <ul class="mt-1">
              <li
                v-for="session in game.sessions"
                :key="session.id"
                class="text-sm py-1"
              >
                {{
                  format(new Date(session.start_time), "EEE, MMM do h:mm aa")
                }}
                -
                {{ format(new Date(session.end_time), "h:mm aa") }}
              </li>
            </ul>
          </DisclosurePanel>
        </transition>
      </Disclosure>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, ref, onMounted } from "vue";
import { format } from "date-fns";
import { GameListing } from "@/typings/Game";
import Heading from "../Heading.vue";
import { getCoverImageUrl } from "@/api/storage";
import { pluralize } from "@/util/grammar";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

const props = defineProps({
  game: {
    type: Object as PropType<GameListing>,
    required: true,
  },
});

const coverImageUrl = ref("");

onMounted(async () => {
  if (props.game.cover_image) {
    coverImageUrl.value = await getCoverImageUrl(props.game.cover_image, false);
  }
});
</script>
