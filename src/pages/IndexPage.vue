<template>
  <BaseTemplate>
    <InfoBanner
      v-if="showConfirmEmailBanner"
      @dismiss="showConfirmEmailBanner = false"
    >
      <p class="font-bold text-slate-700">
        Email change initiated. Please confirm by following the link sent to the
        new email.
      </p>
    </InfoBanner>
    <div class="flex flex-col gap-12 mt-12">
      <div class="grid lg:grid-cols-2 gap-6">
        <IllustratedLinkCard
          img-path="/images/task_list.png"
          title="Welcome to Playabl"
          sub-title="Here are some guides to help you get started on Playabl"
          :links="[
            {
              href: 'https://docs.playabl.io/guides/communities/finding-communities.html',
              label: 'Finding and joining communities',
              external: true,
            },
            {
              href: 'https://docs.playabl.io/guides/games/finding-games.html',
              label: 'Finding and joining games',
              external: true,
            },
            {
              href: 'https://docs.playabl.io/guides/communities/starting-a-community.html',
              label: 'Starting a community',
              external: true,
            },
            {
              href: 'https://docs.playabl.io/guides/events/running-events.html',
              label: 'Running a community event',
              external: true,
            },
          ]"
        />
        <IllustratedLinkCard
          img-path="/images/world_travel.png"
          title="Jump To"
          sub-title="Here are some links to help you get to gaming"
          :links="jumpToLinks"
        />
      </div>
      <section v-if="loadingDb">
        <div class="full-width bg-brand-500 text-white">
          <div
            class="py-12 md:container md:mx-auto max-w-6xl px-12 grid sm:grid-cols-3 min-h-[480px] gap-12 items-center"
          ></div>
        </div>
      </section>
      <section v-if="store.user && !loadingDb">
        <div class="full-width bg-brand-500 text-white">
          <div
            class="py-12 md:container md:mx-auto max-w-6xl px-12 grid sm:grid-cols-3 min-h-[400px] gap-12 items-center"
          >
            <div class="sm:col-span-2 flex flex-col gap-2">
              <p class="text-lg md:text-3xl lg:text-4xl">
                Welcome {{ store.user.username || store.user.email }}
              </p>
              <p class="md:text-lg lg:text-xl text-teal-300 font-semibold">
                Here's your next week of gaming
              </p>
            </div>
            <img
              v-if="isSmAndLarger"
              src="/images/calendar.png"
              class="bg-cover w-full max-w-sm"
              alt=""
            />
          </div>
        </div>
        <div class="my-8 p-8 rounded-lg flex items-center gap-6 bg-teal-300">
          <LightBulbIcon class="w-6 h-6 text-teal-700 shrink-0" />
          <p class="text-teal-900 text-sm md:text-base">
            You can click on a user's image or avatar and see more info about
            times you've played together
          </p>
        </div>
        <div class="flex flex-col gap-12 mt-12">
          <UserDashboard :db="db" />
        </div>
      </section>
      <section v-else-if="!store.user && !loadingDb" id="sign-up">
        <div class="full-width bg-brand-500 text-white">
          <div
            class="py-12 md:container md:mx-auto max-w-6xl px-12 grid sm:grid-cols-3 min-h-[480px] gap-12 items-center"
          >
            <div class="flex flex-col gap-2 place-self-center sm:col-span-2">
              <p class="text-lg md:text-3xl lg:text-4xl font-paytone">
                Join roleplaying communities and games now with your free acount
              </p>
              <BaseButton
                class="text-slate-700 font-bold mt-6 bg-teal-400"
                @click="showSignUp = true"
              >
                Sign up now
              </BaseButton>
            </div>
            <img
              v-if="isSmAndLarger"
              src="/images/task_done.png"
              class="bg-cover w-full max-w-sm"
              alt=""
            />
          </div>
        </div>
      </section>
      <NextWeekGames :db="db" />
    </div>
    <SignUpModal
      :open="showSignUp"
      initial-form="sign-up"
      @signed-in="showSignUp = false"
      @cancel="showSignUp = false"
    />
  </BaseTemplate>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import InfoBanner from "@/components/Banners/InfoBanner.vue";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import { useRoute } from "vue-router";
import { store } from "@/store";
import UserDashboard from "./UserDashboard.vue";
import IllustratedLinkCard from "./Home/IllustratedLinkCard.vue";
import { LightBulbIcon } from "@heroicons/vue/24/outline";
import client from "@/api/client";
import { Session } from "@/typings/Session";
import { Profile } from "@/typings/Profile";
import { Game } from "@/typings/Game";
import NextWeekGames from "./Home/NextWeekGames.vue";
import SignUpModal from "@/components/Modals/SignUpModal.vue";
import BaseButton from "@/components/Buttons/BaseButton.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const route = useRoute();

const showConfirmEmailBanner = ref(
  route.hash.includes(
    "#message=Confirmation+link+accepted.+Please+proceed+to+confirm+link+sent+to+the+other+email",
  ),
);
const showSignUp = ref(false);

const jumpToLinks = computed(() => {
  if (store.user) {
    return [
      {
        href: "/games/browse?sort.key=created_at&sort.dir=desc&filter=open",
        label: "Browse newest games across communities",
      },
      {
        href: "/communities/browse?sort.key=member-count&sort.dir=desc",
        label: "Browse communities",
      },
      {
        href: "/#find-your-next-game",
        label: "Find a game for this week",
      },
    ];
  } else {
    return [
      {
        href: "/#sign-up",
        label: "Sign in or create an account",
      },
      {
        href: "/games/browse?sort.key=created_at&sort.dir=desc&filter=open",
        label: "Browse newest games across communities",
      },
      {
        href: "/communities/browse?sort.key=member-count&sort.dir=desc",
        label: "Browse communities",
      },
      {
        href: "/#find-your-next-game",
        label: "Find a game for this week",
      },
    ];
  }
});

export type sessionWithGame = Omit<Session, "game_id"> & {
  game_id: Game & {
    sessions: Session[];
    community_id: {
      name: string;
      id: string;
      url_short_name?: string;
    };
  };
};
export type sessionWithGameTitleAndId = Session & {
  game_id: {
    title: string;
    id: number;
  };
};

export type playerHistoryType = Profile & {
  jointSessions: sessionWithGameTitleAndId[];
  sessionsWithUserAsGM: sessionWithGameTitleAndId[];
  sessionsWithPlayerAsGM: sessionWithGameTitleAndId[];
  uniqueGamesCount: number;
};
export type playerHistoryMap = Record<string, playerHistoryType>;

export type dashboard = {
  playing: sessionWithGame[];
  managing: sessionWithGame[];
  games: sessionWithGame[];
  playerHistory: playerHistoryMap;
};

const db = ref<dashboard>({
  playing: [],
  managing: [],
  games: [],
  playerHistory: {},
});

const loadingDb = ref(true);

async function loadDashboard() {
  loadingDb.value = true;
  const { data } = await client.get("/.netlify/functions/dashboard");
  db.value = data;
  loadingDb.value = false;
}
onMounted(loadDashboard);
watch(
  () => store.user,
  (newVal, lastVal) => {
    if (newVal?.id && newVal.id !== lastVal?.id && !loadingDb.value) {
      loadDashboard();
    }
  },
);
</script>
