<template>
  <section v-if="true" class="relative">
    <Menu>
      <MenuButton class="hover:underline">
        <div
          class="rounded-full w-8 h-8 bg-brand-200 text-brand-500 grid place-items-center content-center"
        >
          J
        </div>
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
          class="absolute -right-full p-2 mt-2 mr-2 flex flex-col items-start space-y-2 bg-white border border-grey-50 rounded-lg shadow-md text-slate-900"
        >
          <MenuItem v-slot="{ active }">
            <router-link
              :class="{ [activeMenuItem]: active }"
              class="px-2 py-1 rounded-md w-full"
              to="/profile"
            >
              Profile
            </router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <a
              :class="{ [activeMenuItem]: active }"
              class="whitespace-nowrap px-2 py-1 rounded-md w-full"
              href="/account-settings"
            >
              Sign out
            </a>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
  </section>
  <router-link v-else to="/sign-in">Sign in</router-link>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { store } from "../store";
const activeMenuItem = "bg-gray-100 cursor-pointer";
</script>
