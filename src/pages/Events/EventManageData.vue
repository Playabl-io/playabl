<template>
  <div class="grid sm:grid-cols-3 gap-6">
    <DataTile
      title="Games"
      :value="eventStore.eventGames?.length || 0"
      :table="gameTable"
    />
    <DataTile title="Sessions" :value="sessions.length" :table="sessionTable" />
  </div>
</template>
<script setup lang="ts">
import { computed, h } from "vue";
import { eventStore } from "./eventStore";
import DataTile from "@/components/Data/DataTile.vue";
import {
  getCoreRowModel,
  useVueTable,
  createColumnHelper,
  getSortedRowModel,
} from "@tanstack/vue-table";
import { Game } from "@/typings/Game";
import { Session } from "@/typings/Session";
import { format } from "date-fns";
import { Profile } from "@/typings/Profile";
import { RouterLink } from "vue-router";

const sessions = computed(() => {
  return (
    eventStore.eventGames?.reduce((acc, cur) => {
      return acc.concat(cur.sessions);
    }, [] as Session[]) ?? []
  );
});

const gameColumnHelper = createColumnHelper<
  Game & { sessions: Session[]; profiles: Profile }
>();
const gameColumns = [
  gameColumnHelper.accessor("title", {
    header: "Title",
    cell: (info) => info.getValue(),
  }),
  gameColumnHelper.accessor("profiles", {
    header: "Creator",
    cell: (info) => {
      const value = info.getValue();
      return value.username ?? value.email;
    },
  }),
  gameColumnHelper.accessor("sessions", {
    header: "Sessions",
    cell: (info) => info.getValue().length,
  }),
  gameColumnHelper.accessor("created_at", {
    header: "Created at",
    cell: (info) => {
      const value = info.getValue();
      return format(new Date(value), "LLLL do h:mm a");
    },
  }),
  gameColumnHelper.display({
    id: "actions",
    cell: (props) => {
      const original = props.row.original;
      return h(
        RouterLink,
        {
          to: `/games/${original.id}`,
          class: "text-blue-700 underline decoration-dashed",
        },
        () => "View"
      );
    },
  }),
];

const gameTable = useVueTable({
  get data() {
    return eventStore.eventGames ?? [];
  },
  columns: gameColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

const sessionsColumnHelper = createColumnHelper<Session>();
const sessionColumns = [
  sessionsColumnHelper.accessor("game_id", {
    header: "Game ID",
    cell: (cell) => cell.getValue(),
  }),
  sessionsColumnHelper.accessor("start_time", {
    header: "Start time",
    cell: (cell) => format(new Date(cell.getValue()), "LLLL do h:mm a"),
  }),
  sessionsColumnHelper.accessor("end_time", {
    header: "End time",
    cell: (cell) => format(new Date(cell.getValue()), "LLLL do h:mm a"),
  }),
];

const sessionTable = useVueTable({
  get data() {
    return sessions.value;
  },
  columns: sessionColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

const uniqRsvps = computed(() => {
  if (!eventStore.eventGames) {
    return {
      sessionCount: 0,
      rsvpCount: 0,
    };
  }
  const allRsvps: string[] = [];
  eventStore.eventGames.forEach((game) => {
    game.sessions.forEach((session) => {
      allRsvps.push(...session.rsvps);
    });
  });
  const uniq = new Set([...allRsvps]);

  return uniq;
});

const sessionsByUser = computed(() => {
  return sessions.value.reduce((acc, cur) => {
    cur.rsvps.forEach((rsvp) => {
      if (acc[rsvp]) {
        acc[rsvp].push(cur);
      } else {
        acc[rsvp] = [cur];
      }
    });
    return acc;
  }, {} as Record<string, Session[]>);
});
</script>
