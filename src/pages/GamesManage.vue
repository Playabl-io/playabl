<template>
  <AuthShell>
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
                Upcoming
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
                Past
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
          </TabPanels>
        </TabGroup>
      </section>
    </BaseTemplate>
  </AuthShell>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import * as R from "ramda";
import { GameListing } from "@/typings/Game";
import GameCard from "@/components/Game/GameCard.vue";
import Heading from "@/components/Heading.vue";
import { loadManagedGames, loadPastManagedGames } from "@/api/gamesAndSessions";
import { store } from "@/store";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { pluralize } from "@/util/grammar";
import AuthShell from "@/layouts/AuthShell.vue";

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const pastGames = ref<GameListing[]>([]);

onMounted(async () => {
  await Promise.all([loadUpcomingGames(), loadPastGames()]);
  isLoading.value = false;
});

async function loadUpcomingGames() {
  if (!store.user) return;
  const data = await loadManagedGames(store.user.id);
  if (data) {
    const [withSessions, withoutSessions] = R.partition(
      (game) => game?.sessions?.length > 0,
      data,
    );
    games.value = withSessions.concat(withoutSessions);
  }
}
async function loadPastGames() {
  if (!store.user) return;
  const data = await loadPastManagedGames(store.user.id);
  if (data) {
    pastGames.value = data;
  }
}
</script>
