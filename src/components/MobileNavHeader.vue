<template>
  <header>
    <Menu>
      <MenuButton class="m-2 p-2">
        <MenuIcon class="text-slate-900 dark:text-slate-100 h-6 w-6" />
      </MenuButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="absolute bottom-0 w-full border-t border-gray-100 flex flex-col space-y-4 bg-gray-50 rounded-lg shadow-md text-slate-900 p-4 z-20"
        >
          <menu-item>
            <router-link to="/" class="font-paytone text-lg p-2">
              Playabl
            </router-link>
          </menu-item>
          <MenuItem>
            <router-link
              class="px-2 py-1"
              :to="`${store.user ? '/communities/joined' : '/communities/all'}`"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Communities
            </router-link>
          </MenuItem>
          <MenuItem>
            <router-link
              class="px-2 py-1"
              to="/games/joined"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Games
            </router-link>
          </MenuItem>
          <hr />
          <menu-item>
            <router-link
              class="px-2 py-1"
              to="/profile"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Profile
            </router-link>
          </menu-item>
          <menu-item>
            <outline-button>Sign out</outline-button>
          </menu-item>
        </MenuItems>
      </transition>
    </Menu>
  </header>
</template>
<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import OutlineButton from "./Buttons/OutlineButton.vue";
import { MenuIcon } from "@heroicons/vue/solid";
import { store } from "@/store";
</script>
