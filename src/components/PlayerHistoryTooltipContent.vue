<template>
  <div class="grid gap-6">
    <UserBadge
      :avatar-url="playerHistory.avatar_url"
      :username="playerHistory.username || playerHistory.email || 'No name set'"
      :pronouns="playerHistory.pronouns"
    />
    <div class="flex items-center gap-6 text-white p-4 rounded-md bg-brand-500">
      <PuzzlePieceIcon class="w-8 h-8" />
      <div class="flex flex-col gap-1">
        <p v-if="playerHistory.uniqueGamesCount === 1">
          This is your first time playing with them!
        </p>
        <template v-else>
          <p>
            You've played {{ playerHistory.uniqueGamesCount }} games together!
          </p>
          <p class="text-xs">
            Most recently,
            <span class="font-semibold">
              {{ mostRecentSession?.game_id?.title }}
            </span>
          </p>
        </template>
      </div>
    </div>
    <div>
      <p class="text-xs font-semibold mb-2">
        All sessions together (all time). Click a tile for more details.
      </p>
      <div class="grid sm:grid-cols-3 gap-4">
        <DataTile
          variant="outline"
          :table="playedTogetherTable"
          title="Both as players"
          :value="playerHistory.jointSessions.length"
        />
        <DataTile
          variant="outline"
          :table="playerIsFacilitatorTable"
          title="Sessions they facilitated"
          :value="playerHistory.sessionsWithPlayerAsGM.length"
        />
        <DataTile
          variant="outline"
          :table="userIsFacilitatorTable"
          title="Sessions you facilitated"
          :value="playerHistory.sessionsWithUserAsGM.length"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, h } from "vue";
import { PuzzlePieceIcon } from "@heroicons/vue/24/outline";
import { playerHistoryType } from "@/pages/IndexPage.vue";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { format } from "date-fns";
import { RouterLink } from "vue-router";
import DataTile from "./Data/DataTile.vue";
import UserBadge from "./UserBadge.vue";
const props = defineProps({
  playerHistory: {
    type: Object as PropType<playerHistoryType>,
    required: true,
  },
});

const allSessions = computed(() => [
  ...props.playerHistory.jointSessions,
  ...props.playerHistory.sessionsWithPlayerAsGM,
  ...props.playerHistory.sessionsWithUserAsGM,
]);

const mostRecentSession = computed(() => {
  const now = new Date().getTime();
  return allSessions.value.reduce((lowest, cur) => {
    if (cur.start_time < now && cur.start_time < lowest.start_time) {
      return cur;
    }
    return lowest;
  });
});

const sessionColumnHelper =
  createColumnHelper<playerHistoryType["jointSessions"][0]>();
const sessionColumns = [
  sessionColumnHelper.accessor("game_id.title", {
    header: "Game title",
    cell: (info) => info.getValue(),
  }),
  sessionColumnHelper.accessor("start_time", {
    header: "Session time",
    cell: (info) => {
      const value = info.getValue();
      return format(new Date(value), "LLLL do h:mm a");
    },
  }),
  sessionColumnHelper.display({
    id: "actions",
    cell: (props) => {
      const original = props.row.original;
      console.log({ original });
      return h(
        RouterLink,
        {
          to: `/games/${original.game_id.id}`,
          class: "text-blue-700 underline decoration-dashed",
        },
        () => "View",
      );
    },
  }),
];

const playedTogetherTable = useVueTable({
  get data() {
    return props.playerHistory.jointSessions;
  },
  columns: sessionColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
const userIsFacilitatorTable = useVueTable({
  get data() {
    return props.playerHistory.sessionsWithUserAsGM;
  },
  columns: sessionColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
const playerIsFacilitatorTable = useVueTable({
  get data() {
    return props.playerHistory.sessionsWithPlayerAsGM;
  },
  columns: sessionColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
</script>
