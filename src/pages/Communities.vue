<template>
  <base-template>
    <Heading level="h1">Communities</Heading>
    <section class="mt-12 flex justify-between items-baseline text-sm">
      <div class="flex space-x-4 py-2">
        <p class="border-b border-brand-500">Joined</p>
        <p>Browse</p>
      </div>
      <router-link to="/communities/new" class="hover:underline">
        Create a new community
      </router-link>
    </section>
    <section class="grid grid-cols-1 gap-8 mt-12">
      <template v-for="community in fakeCommunities" :key="community.id">
        <Listing :heading="community.name">
          <template #website>
            <a
              class="text-slate-600 hover:underline active:underline prose prose-sm"
              :href="community.website"
            >
              {{ community.website }}
            </a>
          </template>
          <template #description>{{ community.description }}</template>
        </Listing>
        <hr class="last:hidden border-gray-300" />
      </template>
    </section>
  </base-template>
</template>
<script setup lang="ts">
import BaseTemplate from "@/components/BaseTemplate.vue";
import Heading from "@/components/Heading.vue";
import Listing from "@/components/Listing.vue";

const fakeCommunities = [
  {
    id: 2,
    name: "Friends at the Table",
    description:
      "Friends at the Table is a premier space for indie and storygamers. We host a calendar of monthly games as well as publish podcasts, games, and much more.",
    website: "https://www.friendsatthetable.com",
  },
  {
    id: 1,
    name: "The Gauntlet",
    description:
      "The Gauntlet is a premier space for indie and storygamers. We host a calendar of monthly games as well as publish podcasts, games, and much more. The Gauntlet is a premier space for indie and storygamers. We host a calendar of monthly games as well as publish podcasts, games, and much more.",
    website: "https://gauntlet-rpg.com",
  },
  {
    id: 3,
    name: "r/OSR",
    description: "OSR community",
    website: "https://reddit.com/r/osr",
  },
  {
    id: 4,
    name: "Friends at the Table",
    description:
      "Friends at the Table is a premier space for indie and storygamers. We host a calendar of monthly games as well as publish podcasts, games, and much more.",
    website: "https://gauntlet-rpg.com",
  },
];
</script>
