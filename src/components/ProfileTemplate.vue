<template>
  <base-template>
    <div class="grid profile-grid gap-8 items-start">
      <nav class="flex flex-col gap-4 md:sticky md:top-[7.5rem]">
        <router-link
          to="profile"
          class="flex gap-4 p-2 rounded-md"
          active-class="bg-purple-100 text-brand-500"
        >
          <UserCircleIcon class="h-6 w-6" />
          Profile
        </router-link>
        <router-link
          to="notifications"
          class="flex gap-4 p-2 rounded-md"
          active-class="bg-purple-100 text-brand-500"
        >
          <BellIcon class="h-6 w-6" />
          Notifications
        </router-link>
        <router-link
          to="media"
          class="flex gap-4 p-2 rounded-md"
          active-class="bg-purple-100 text-brand-500"
        >
          <PhotographIcon class="h-6 w-6" />
          Media
        </router-link>
        <router-link
          to="settings"
          class="flex gap-4 p-2 rounded-md"
          active-class="bg-purple-100 text-brand-500"
        >
          <AdjustmentsIcon class="h-6 w-6" />
          Settings
        </router-link>
      </nav>
      <div>
        <slot></slot>
      </div>
    </div>
  </base-template>
</template>

<script setup lang="ts">
import {
  BellIcon,
  UserCircleIcon,
  AdjustmentsIcon,
  PhotographIcon,
} from "@heroicons/vue/outline";
import BaseTemplate from "@/components/BaseTemplate.vue";
</script>
<style scoped>
.profile-grid {
  grid-template-columns: 1fr;
  grid-template-rows: auto;
}
@media screen(md) {
  .profile-grid {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
}
</style>
