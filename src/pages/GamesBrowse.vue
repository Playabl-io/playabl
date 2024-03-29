<template>
  <BaseTemplate>
    <BrowsePageTemplate
      title="Game"
      allow-create-new
      @create-new="
        router.push({
          path: '/games/new',
        })
      "
    >
      <template #page-controls>
        <div class="grid gap-4">
          <UrlSortDropdown />
          <div class="flex flex-col">
            <FormLabel>Community</FormLabel>
            <FormMultiSelect
              v-model="communities"
              :options="communityOptions"
              label="Filter by community"
            />
          </div>
          <div class="flex flex-col">
            <FormLabel>System</FormLabel>
            <FilterDropdown
              v-model="system"
              :options="gameSystemList"
              placeholder="Select or enter system"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col">
              <FormLabel>Min Players</FormLabel>
              <FormInput v-model="min" type="number" />
            </div>
            <div class="flex flex-col">
              <FormLabel>Max Players</FormLabel>
              <FormInput v-model="max" type="number" />
            </div>
          </div>
          <div>
            <div class="mb-2">
              <FormLabel no-margin
                >Time of Day
                <Tooltip position="right">
                  <template #trigger="{ toggleTooltip }">
                    <InformationCircleIcon
                      class="w-4 h-5"
                      @mouseenter="toggleTooltip"
                      @mouseleave="toggleTooltip"
                      @focus="toggleTooltip"
                      @blur="toggleTooltip"
                    />
                  </template>
                  <template #tooltip>
                    <p class="max-w-sm">
                      Time of day will limit results to games with one or more
                      sessions that fall within the time window. To find
                      sessions that cross borders of days, specify only one
                      boundary.
                    </p>
                  </template>
                </Tooltip>
              </FormLabel>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <p class="text-xs font-semibold">Start time</p>
                <FormInput v-model="starttime" type="time" />
              </div>
              <div class="flex flex-col gap-1">
                <p class="text-xs font-semibold">End time</p>
                <FormInput v-model="endtime" type="time" />
              </div>
            </div>
            <button
              v-if="store.user"
              class="text-blue-700 text-xs underline my-1"
              @click="setUserSettings"
            >
              Save time preference to my profile
            </button>
          </div>

          <div class="flex flex-col">
            <FormLabel no-margin>Filter</FormLabel>
            <div class="flex items-center gap-2 mt-2 mb-3">
              <FormCheckbox id="open" v-model="filter" value="open" />
              <FormLabel for="open" no-margin>Has Openings</FormLabel>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <FormCheckbox id="recorded" v-model="filter" value="recorded" />
              <FormLabel for="recorded" no-margin>Is Recorded</FormLabel>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <FormCheckbox
                id="safety-tools"
                v-model="filter"
                value="safety-tools"
              />
              <FormLabel for="safety-tools" no-margin
                >Uses Safety Tools</FormLabel
              >
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="mb-6">
          <Heading as="h6" level="h6" class="text-right">
            {{
              `${filteredByTimeRange.length} ${pluralize({
                count: filteredByTimeRange.length,
                singular: "result",
              })}`
            }}
          </Heading>
        </div>
        <GamesListing
          :is-loading="isLoading"
          :games="filteredByTimeRange"
          @add-user-to-game-session="addUserToGameSession"
        />
      </template>
    </BrowsePageTemplate>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import BrowsePageTemplate from "@/layouts/BrowsePageTemplate.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import GamesListing from "@/components/GamesListing.vue";
import { GameListing } from "@/typings/Game";
import {
  filterGameSessionsByTimeRange,
  loadBrowsableGames,
} from "@/api/gamesAndSessions";
import { useRouter, useRoute } from "vue-router";
import { useRouteQuery } from "@vueuse/router";
import UrlSortDropdown from "@/components/Search/UrlSortDropdown.vue";
import {
  SORT_DIR,
  SORT_DIR_PATH,
  SORT_KEY,
  SORT_KEY_PATH,
  ensureRouteQueryIsArray,
} from "@/util/urlParams";
import FormInput from "@/components/Forms/FormInput.vue";
import gameSystemList from "@/util/gameSystemList";
import FilterDropdown from "@/components/Dropdown/FilterDropdown.vue";
import { store } from "@/store";
import { supabase } from "@/supabase";
import FormMultiSelect from "@/components/Forms/FormMultiSelect.vue";
import { pluralize } from "@/util/grammar";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import Tooltip from "@/components/Tooltip.vue";
import useToast from "@/components/Toast/useToast";

const { showSuccess, showError } = useToast();

const route = useRoute();
const router = useRouter();

const filter = useRouteQuery("filter", [] as string[], {
  transform: ensureRouteQueryIsArray,
});
const min = useRouteQuery("min-players", undefined);
const max = useRouteQuery("max-players", undefined);
const starttime = ref(store.userSettings?.starttime);
const endtime = ref(store.userSettings?.endtime);
const system = useRouteQuery("system", "");
const communities = useRouteQuery("communities", [], {
  transform: ensureRouteQueryIsArray,
});

const isLoading = ref(true);
const games = ref<GameListing[]>([]);
const communityOptions = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  loadCommunityNames();
  loadGames();
});

onUnmounted(() => {
  if (store.user) {
    // reset the userSettings to match what is saved to the profile
    store.userSettings = { ...store.user?.user_settings };
  }
});

async function loadCommunityNames() {
  const { data } = await supabase
    .from("communities")
    .select("id, name")
    .is("deleted_at", null);
  if (data) {
    communityOptions.value = data.map((record) => ({
      label: record.name,
      value: record.id,
    }));
  }
}

async function loadGames() {
  isLoading.value = true;
  games.value = [];
  const openOnly = filter.value.includes("open");
  const isRecorded = filter.value.includes("recorded");
  const usesSafetyTools = filter.value.includes("safety-tools");
  const data = await loadBrowsableGames({
    sortKey: route.query[SORT_KEY_PATH] as SORT_KEY,
    sortDir: route.query[SORT_DIR_PATH] as SORT_DIR,
    openOnly,
    isRecorded,
    usesSafetyTools,
    communities: communities.value,
    minPlayer: min.value,
    maxPlayer: max.value,
    system: system.value,
  });
  if (data) {
    games.value = data as GameListing[];
  }
  isLoading.value = false;
}

async function setUserSettings() {
  const update = {
    ...store.userSettings,
    starttime: starttime.value,
    endtime: endtime.value,
  };
  if (store?.user?.id) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          user_settings: update,
        })
        .eq("id", store.user.id);
      store.user.user_settings = update;
      if (error) {
        throw error;
      }
      showSuccess({ message: "Time preference saved" });
    } catch (error) {
      showError({ message: "Unable to save user settings" });
    }
  }
}

watch([route], () => {
  loadGames();
});

watch(starttime, async (newTime) => {
  const update = {
    ...store.userSettings,
    starttime: newTime,
    endtime: endtime.value,
  };

  store.userSettings = update;
});

watch(endtime, async (newTime) => {
  const update = {
    ...store.userSettings,
    starttime: starttime.value,
    endtime: newTime,
  };

  store.userSettings = update;
});

const filteredByTimeRange = computed(() => {
  const byTimeRange = games.value.filter((game) => {
    return filterGameSessionsByTimeRange(
      game,
      starttime.value ?? "",
      endtime.value ?? ""
    );
  });
  return byTimeRange;
});

function addUserToGameSession({
  gameId,
  sessionId,
  userId,
}: {
  gameId: number;
  sessionId: string;
  userId: string;
}) {
  games.value = games.value.map((game) => {
    if (game.id === gameId) {
      game.sessions = game.sessions.map((session) => {
        if (session.id === sessionId) {
          session.rsvps.push(userId);
        }
        return session;
      });
    }
    return game;
  });
}
</script>
