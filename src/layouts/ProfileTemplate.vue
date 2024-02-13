<template>
  <BaseTemplate>
    <SideNavTemplate>
      <template #nav>
        <SideNavLink to="/profile">
          <UserCircleIcon class="h-6 w-6" />
          <div class="inline-block sm:hidden lg:inline-block">Profile</div>
        </SideNavLink>
        <SideNavLink to="/notifications">
          <BellIcon class="h-6 w-6" />
          <div class="inline-block sm:hidden lg:inline-block">
            Notifications
          </div>
        </SideNavLink>
        <SideNavLink to="/media">
          <PhotoIcon class="h-6 w-6" />
          <div class="inline-block sm:hidden lg:inline-block">Media</div>
        </SideNavLink>
        <SideNavLink to="/settings">
          <AdjustmentsVerticalIcon class="h-6 w-6" />
          <div class="inline-block sm:hidden lg:inline-block">Settings</div>
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
  AdjustmentsVerticalIcon,
  PhotoIcon,
} from "@heroicons/vue/24/outline";
import SideNavTemplate from "./SideNavTemplate.vue";
import BaseTemplate from "./BaseTemplate.vue";
import SideNavLink from "@/components/Navigation/SideNavLink.vue";
import AuthShell from "./AuthShell.vue";
</script>
