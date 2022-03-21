<template>
  <BaseTemplate>
    <SideNavTemplate>
      <template #nav>
        <SideNavLink to="profile">
          <UserCircleIcon class="h-6 w-6" />
          Profile
        </SideNavLink>
        <SideNavLink to="notifications">
          <BellIcon class="h-6 w-6" />
          Notifications
        </SideNavLink>
        <SideNavLink to="media">
          <PhotographIcon class="h-6 w-6" />
          Media
        </SideNavLink>
        <SideNavLink to="settings">
          <AdjustmentsIcon class="h-6 w-6" />
          Settings
        </SideNavLink>
      </template>
      <template #content>
        <slot></slot>
      </template>
    </SideNavTemplate>
  </BaseTemplate>
</template>

<script setup lang="ts">
import {
  BellIcon,
  UserCircleIcon,
  AdjustmentsIcon,
  PhotographIcon,
} from "@heroicons/vue/outline";
import SideNavTemplate from "./SideNavTemplate.vue";
import BaseTemplate from "./BaseTemplate.vue";
import SideNavLink from "./Navigation/SideNavLink.vue";
</script>
