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
    <div class="grid lg:grid-cols-2 gap-6 mt-8 mb-12">
      <IllustratedLinkCard
        img-path="/images/task_list.png"
        title="Welcome to Playabl"
        sub-title="Here are some guides to help you get started on Playabl"
        :links="[
          {
            href: '#',
            label: 'Finding and joining communities',
          },
          {
            href: '#',
            label: 'Finding and joining games',
          },
          {
            href: '#',
            label: 'Starting a community',
          },
          {
            href: '#',
            label: 'Running a community event',
          },
        ]"
      />
      <IllustratedLinkCard
        img-path="/images/world_travel.png"
        title="Jump To"
        sub-title="Here are some links to help you get to gaming"
        :links="[
          {
            href: '#',
            label: 'Browse newest games in your communities',
          },
          {
            href: '/#find-your-next-game',
            label: 'Find a game for this week',
          },
          {
            href: '#',
            label: 'See all of your upcoming games',
          },
        ]"
      />
    </div>
    <div v-if="store.user">
      <div class="full-width bg-brand-500 text-white min-h-[250px]">
        <div
          class="py-4 md:container md:mx-auto max-w-6xl px-4 grid grid-cols-2 gap-2 items-center"
        >
          <div class="flex flex-col gap-2 place-self-center">
            <p class="text-lg md:text-2xl">
              Welcome {{ store.user.username || store.user.email }}
            </p>
            <p class="md:text-lg text-teal-300 font-semibold">
              Here's your next week of gaming
            </p>
          </div>
          <img
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
    </div>
    <section
      v-else
      class="full-width bg-gradient-to-br from-blue-700 to-blue-900 py-12"
    >
      <div class="p-4 md:container md:mx-auto max-w-6xl">
        <Heading id="find-your-next-game" as="h4" level="h4" class="text-white">
          Ready for another game?
        </Heading>
        <p class="text-sm mt-2 mb-4 text-white">
          Sessions with openings in the next seven days
        </p>
        <div
          class="py-8 min-h-[400px] flex gap-6 overflow-auto snap-x snap-mandatory rounded-md"
        >
          <div
            v-for="game in db.games"
            :key="game.id"
            class="snap-center flex-none w-80"
          >
            <MiniGameItem
              :session="game"
              :all-game-sessions="game.game_id.sessions"
            />
          </div>
        </div>
      </div>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
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
import Heading from "@/components/Heading.vue";
import MiniGameItem from "./Community/MiniGameItem.vue";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { Game } from "@/typings/Game";

const route = useRoute();

const showConfirmEmailBanner = ref(
  route.hash.includes(
    "#message=Confirmation+link+accepted.+Please+proceed+to+confirm+link+sent+to+the+other+email",
  ),
);

export type sessionWithGame = Session & {
  game_id: Game & {
    sessions: Session[];
    community_events: CommunityEvent | null;
  };
  community_id: {
    name: string;
    id: string;
    url_short_name?: string;
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

onMounted(async () => {
  const { data } = await client.get("/.netlify/functions/dashboard");
  db.value = data;
});
</script>
