<template>
  <BaseTemplate>
    <section>
      <Heading level="h4" as="h2" class="mb-3">Games you created</Heading>
      <div v-if="isLoading" class="grid place-content-center">
        <LoadingSpinner color="brand-500" />
      </div>
      <TabGroup v-else>
        <TabList class="flex gap-4">
          <Tab v-slot="{ selected }" as="template">
            <button
              class="py-2 text-sm focus-styles"
              :class="{
                'text-brand-500 border-b border-brand-500': selected,
                'bg-transparent text-black': !selected,
              }"
            >
              Upcoming games
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button
              class="py-2 text-sm focus-styles"
              :class="{
                'text-brand-500 border-b border-brand-500': selected,
                'bg-transparent text-black': !selected,
              }"
            >
              Past games
            </button>
          </Tab>
          <Tab v-slot="{ selected }" as="template">
            <button
              class="py-2 text-sm focus-styles"
              :class="{
                'text-brand-500 border-b border-brand-500': selected,
                'bg-transparent text-black': !selected,
              }"
            >
              Draft games
            </button>
          </Tab>
        </TabList>
        <TabPanels class="mt-6">
          <TabPanel
            class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            <p v-if="games.length === 0" class="text-sm col-span-full">
              No upcoming games
            </p>
            <GameCard v-for="game in games" :key="game.id" :game="game" />
          </TabPanel>
          <TabPanel
            class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            <p v-if="pastGames.length === 0" class="text-sm col-span-full">
              No past games
            </p>
            <GameCard v-for="game in pastGames" :key="game.id" :game="game">
              <template #sessions-title>
                {{ game.sessions.length }}
                {{
                  pluralize({
                    count: game.sessions.length,
                    singular: "session",
                  })
                }}
              </template>
            </GameCard>
          </TabPanel>
          <TabPanel
            class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            <Well class="col-span-full grid gap-2">
              <p class="text-sm">
                Create a draft game from the
                <RouterLink to="/games/new" class="text-blue-700 underline"
                  >new game screen</RouterLink
                >.
              </p>
              <p class="text-sm">
                You can use draft games to save in progress work, or to create
                "templates" if you play the same kind of game frequently. Create
                a draft with the base settings defined, and use it to quickly
                post a new game whenever you like.
              </p>
              <p class="text-sm">
                Draft games are only deleted when you choose to do so.
              </p>
            </Well>
            <p v-if="draftGames.length === 0" class="text-sm col-span-full">
              No draft games
            </p>
            <div
              v-for="draft in draftGames"
              :key="draft.id"
              class="p-4 rounded-lg bg-white relative"
            >
              <p class="absolute top-2 right-4 text-xs">ID: {{ draft.id }}</p>
              <p class="text-lg font-bold mb-3">
                {{ draft.game_json?.title || "Untitled game" }}
              </p>
              <div class="flex gap-2 justify-between text-sm">
                <p>Created at:</p>
                <p>
                  {{
                    format(new Date(draft.created_at), "EEE, MMM do hh:mm aa")
                  }}
                </p>
              </div>
              <div class="flex justify-between text-sm">
                <p>Last updated:</p>
                <p>
                  {{
                    format(new Date(draft.updated_at), "EEE, MMM do hh:mm aa")
                  }}
                </p>
              </div>
              <div class="flex gap-2 mt-3">
                <SecondaryButton
                  size="small"
                  :to="`/games/new?from_draft=true&draft_id=${draft.id}`"
                  >Edit</SecondaryButton
                >
                <WarningButton size="small" @click="confirmDelete(draft.id)"
                  >Delete</WarningButton
                >
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import * as R from "ramda";
import { Game, GameListing } from "@/typings/Game";
import GameCard from "@/components/Game/GameCard.vue";
import Heading from "@/components/Heading.vue";
import {
  deleteDraftGame,
  loadDraftManagedGames,
  loadManagedGames,
  loadPastManagedGames,
} from "@/api/gamesAndSessions";
import { store } from "@/store";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { pluralize } from "@/util/grammar";
import { format } from "date-fns";
import WarningButton from "@/components/Buttons/WarningButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import Well from "@/components/Well.vue";
import useToast from "@/components/Toast/useToast";

const { showError, showSuccess } = useToast();

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const pastGames = ref<GameListing[]>([]);
const draftGames = ref<
  {
    id: number;
    created_at: string;
    updated_at: string;
    game_json: Partial<Game>;
    sessions_json: unknown;
    preseating_json: unknown;
  }[]
>([]);

onMounted(async () => {
  await Promise.all([loadUpcomingGames(), loadPastGames(), loadDraftGames()]);
  isLoading.value = false;
});

async function loadUpcomingGames() {
  if (!store.user) {
    throw new Error("No user");
  }
  const data = await loadManagedGames(store.user.id);
  if (data) {
    const [withSessions, withoutSessions] = R.partition(
      (game) => game?.sessions?.length > 0,
      data
    );
    games.value = withSessions.concat(withoutSessions);
  }
}
async function loadPastGames() {
  if (!store.user) {
    throw new Error("No user");
  }
  const data = await loadPastManagedGames(store.user.id);
  if (data) {
    pastGames.value = data;
  }
}
async function loadDraftGames() {
  if (!store.user) {
    throw new Error("No user");
  }
  const data = await loadDraftManagedGames(store.user.id);
  if (data) {
    draftGames.value = data;
  }
}

async function confirmDelete(id: number) {
  if (window.confirm(`Are you sure you want to delete draft game ${id}?`)) {
    try {
      await deleteDraftGame(id);
      showSuccess({ message: "Draft game deleted" });
      draftGames.value = draftGames.value.filter((draft) => draft.id !== id);
    } catch (error) {
      showError({
        message:
          "Sorry, something went wrong. Please try again or file an issue.",
      });
    }
  }
}
</script>
