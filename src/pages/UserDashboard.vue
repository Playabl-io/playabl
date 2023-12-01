<template>
  <section>
    <div class="p-4 bg-white rounded-md shadow-sm">
      <p class="text-lg mb-6">
        Playing in
        <span class="font-bold text-xl">{{ db.playing.length }}</span>
        {{
          pluralize({
            count: db.playing.length,
            singular: "session",
          })
        }}
      </p>
      <div class="flex flex-col gap-3">
        <div
          v-for="session in db.playing"
          :key="session.id"
          class="border border-gray-300 p-4 rounded-lg grid gap-6 playing-session-grid"
        >
          <div class="[grid-area:info] grid gap-6 md:grid-cols-2">
            <SessionName :session="session" />
            <SessionTime :session="session" />
          </div>
          <div
            class="[grid-area:facilitator] bg-gray-100 rounded-lg p-4 flex flex-col"
          >
            <p class="text-sm font-semibold mb-3">Your facilitator</p>
            <p class="grow">
              {{ db.playerHistory[session.creator_id].bio || "No bio set" }}
            </p>
            <div class="flex gap-4 mt-4">
              <MemberCheckAvatar
                :avatar-url="db.playerHistory[session.creator_id].avatar_url"
                :username-or-email="
                  db.playerHistory[session.creator_id].username ||
                  db.playerHistory[session.creator_id].email
                "
                :player-history="db.playerHistory[session.creator_id]"
                :community-id="session.game_id.community_id.id"
                position="top"
              />
              <div class="flex flex-col gap-1">
                <p class="">
                  {{ db.playerHistory[session.creator_id].username }}
                </p>
                <p class="text-sm">
                  {{ db.playerHistory[session.creator_id].pronouns }}
                </p>
                <p class="text-sm">
                  {{ db.playerHistory[session.creator_id].email }}
                </p>
              </div>
            </div>
          </div>
          <div class="[grid-area:players] bg-gray-100 p-4 rounded-lg">
            <p class="text-sm font-semibold mb-3">Playing with</p>
            <div class="flex flex-wrap gap-3">
              <p v-if="session.rsvps.length === 1" class="my-2 text-sm">
                No other players yet
              </p>
              <div v-for="rsvp in session.rsvps" :key="rsvp" class="relative">
                <template v-if="rsvp !== store.user?.id">
                  <MemberCheckAvatar
                    :avatar-url="db.playerHistory[rsvp].avatar_url"
                    :username-or-email="
                      db.playerHistory[rsvp].username ||
                      db.playerHistory[rsvp].email
                    "
                    :player-history="db.playerHistory[rsvp]"
                    :community-id="session.game_id.community_id.id"
                    position="top"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section>
    <div class="p-4 bg-white rounded-md">
      <p class="text-lg mb-6">
        Facilitating
        <span class="font-bold text-xl">{{ db.managing.length }}</span>
        {{
          pluralize({
            count: db.managing.length,
            singular: "session",
          })
        }}
      </p>
      <div class="flex flex-col gap-3">
        <div
          v-for="session in db.managing"
          :key="session.id"
          class="grid gap-6 border border-gray-300 p-4 rounded-lg managing-session-grid"
        >
          <SessionName :session="session" />
          <SessionTime :session="session" />
          <div class="flex flex-col md:ml-auto">
            <div class="flex flex-col gap-1 md:justify-end md:text-right mb-3">
              <p class="text-xl font-paytone">Players</p>
              <p class="text-sm">
                {{ Math.abs(session.rsvps.length - session.participant_count) }}
                {{
                  session.rsvps.length - session.participant_count <= 0
                    ? "seats open"
                    : "waitlisted"
                }}
              </p>
            </div>
            <div class="flex flex-wrap items-center md:justify-end gap-3 mb-2">
              <div v-for="rsvp in session.rsvps" :key="rsvp" class="relative">
                <template v-if="rsvp !== store.user?.id">
                  <MemberCheckAvatar
                    :avatar-url="db.playerHistory[rsvp].avatar_url"
                    :username-or-email="
                      db.playerHistory[rsvp].username ||
                      db.playerHistory[rsvp].email
                    "
                    :player-history="db.playerHistory[rsvp]"
                    :community-id="session.game_id.community_id.id"
                    :position="isMdAndLarger ? 'left' : 'top'"
                    show-new-member-status
                  />
                </template>
              </div>
            </div>
            <div class="ml-auto flex items-center gap-1 col-span-2">
              <HeartIcon class="text-red-500 w-5 h-5" />
              <p class="text-sm text-right">New Member (&lt; 3 months)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="full-width bg-gradient-to-br from-blue-700 to-blue-900 py-12">
    <div class="p-4 md:container md:mx-auto max-w-6xl">
      <Heading id="find-your-next-game" as="h4" level="h4" class="text-white">
        Ready for another game?
      </Heading>
      <p class="text-sm mt-2 mb-4 text-white">
        Sessions with openings in the next seven days
      </p>
      <div
        class="py-8 min-h-[212px] flex gap-6 overflow-auto snap-x snap-mandatory rounded-md"
      >
        <div
          v-for="game in db.games"
          :key="game.id"
          class="snap-center flex-none w-[280px] md:w-[400px]"
        >
          <MiniGameItem
            :session="game"
            :all-game-sessions="game.game_id.sessions"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import { store } from "@/store";
import Heading from "@/components/Heading.vue";
import { pluralize } from "@/util/grammar";
import SessionName from "./Home/SessionName.vue";
import SessionTime from "./Home/SessionTime.vue";
import MemberCheckAvatar from "./Home/MemberCheckAvatar.vue";
import { dashboard } from "./IndexPage.vue";
import { HeartIcon } from "@heroicons/vue/24/solid";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import MiniGameItem from "./Community/MiniGameItem.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMdAndLarger = breakpoints.greater("md");

defineProps({
  db: {
    type: Object as PropType<dashboard>,
    required: true,
  },
});
</script>
<style scoped>
.playing-session-grid {
  grid-template-areas:
    "info"
    "players"
    "facilitator";
}

.managing-session-grid {
  grid-template-columns: 100%;
  grid-template-rows: auto;
}

@media screen(md) {
  .playing-session-grid {
    grid-template-areas:
      "info info facilitator"
      "players players facilitator";
    grid-template-columns: 0.5fr 0.5fr 1fr;
    grid-template-rows: auto;
  }
  .managing-session-grid {
    grid-template-columns: 0.5fr 0.5fr 1fr;
  }
}
</style>
