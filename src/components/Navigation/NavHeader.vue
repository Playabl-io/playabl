<template>
  <header
    class="w-screen py-2 px-12 grid grid-cols-6 sticky top-0 bg-inherit items-center box-border z-10"
    v-bind="$attrs"
  >
    <router-link to="/" class="font-paytone text-lg"> Playabl </router-link>
    <PopoverGroup as="nav" class="mx-auto col-span-4 flex items-center gap-3">
      <NavMenu :open="isHovered">
        <template #title>
          <span ref="myHoverableElement"> Communities </span>
        </template>
        <template #items>
          <NavMenuItem v-if="store.user" to="/communities/joined">
            Joined
          </NavMenuItem>
          <NavMenuItem to="/communities/browse"> Browse </NavMenuItem>
          <NavMenuItem v-if="store.user" to="/communities/manage">
            Manage
          </NavMenuItem>
          <NavMenuItem to="/communities/new"> Create New </NavMenuItem>
        </template>
      </NavMenu>
      <NavMenu>
        <template #title> Games </template>
        <template #items>
          <NavMenuItem v-if="store.user" to="/games/joined">
            Joined
          </NavMenuItem>
          <NavMenuItem to="/games/browse"> Browse </NavMenuItem>
          <NavMenuItem v-if="store.user" to="/games/manage">
            Manage
          </NavMenuItem>
          <NavMenuItem to="/games/new"> Create New </NavMenuItem>
        </template>
      </NavMenu>
      <NavMenu>
        <template #title> Events </template>
        <template #items>
          <NavMenuItem to="/events/browse"> Browse </NavMenuItem>
          <NavMenuItem to="/events/new"> Create New </NavMenuItem>
        </template>
      </NavMenu>
    </PopoverGroup>
    <div class="flex justify-end">
      <user-menu />
    </div>
  </header>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import UserMenu from "../UserMenu.vue";
import { store } from "../../store";
import flags from "@/util/flags";
import { PopoverGroup } from "@headlessui/vue";
import NavMenu from "../Menus/NavMenu.vue";
import NavMenuItem from "../Menus/NavMenuItem.vue";

import { useElementHover } from "@vueuse/core";

const myHoverableElement = ref();
const isHovered = useElementHover(myHoverableElement);
</script>
