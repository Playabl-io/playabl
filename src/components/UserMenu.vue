<template>
  <loading-spinner v-if="isSigningOut" />
  <section class="relative flex flex-col items-center justify-center h-14">
    <Menu v-if="store.user">
      <MenuButton class="hover:underline relative">
        <UserAvatar
          :avatar-url="store.user?.avatar_url"
          :username="store.user.username || store.user.email"
        />
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-70 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-70 opacity-0"
        >
          <div
            v-if="unreadNotifications.length"
            class="h-5 w-5 grid place-content-center bg-blue-200 text-blue-700 text-xs font-semibold p-1 rounded-full absolute -bottom-1 -left-1"
          >
            {{ unreadNotifications.length }}
          </div>
        </transition>
      </MenuButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-70 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-70 opacity-0"
      >
        <MenuItems
          class="absolute top-full right-0 mt-4 p-2 flex flex-col items-start space-y-2 bg-white border border-grey-50 rounded-lg shadow-md text-slate-900"
        >
          <MenuItem v-slot="{ active }">
            <router-link
              :class="{ [activeMenuItem]: active }"
              class="px-2 py-1 rounded-md w-full text-right"
              to="/profile"
            >
              Profile
            </router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
              :class="{ [activeMenuItem]: active }"
              class="px-2 py-1 rounded-md w-full flex items-center text-right"
              to="/notifications"
            >
              <div
                v-if="unreadNotifications.length"
                class="mr-2 h-5 w-5 grid place-content-center bg-blue-200 text-blue-700 text-xs font-semibold p-1 rounded-full"
              >
                {{ unreadNotifications.length }}
              </div>
              Notifications
            </router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button
              :class="{ [activeMenuItem]: active }"
              class="px-2 py-1 rounded-md w-full text-right"
              @click="signOut"
            >
              Sign out
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
    <router-link v-else to="/login" class="whitespace-nowrap hover:underline">
      Sign in
    </router-link>
  </section>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { store } from "../store";
import { unreadNotifications } from "@/util/notifications";
import LoadingSpinner from "./LoadingSpinner.vue";
import { log } from "@/util/logger";
import UserAvatar from "./UserAvatar.vue";
const activeMenuItem = "bg-gray-100 cursor-pointer";

const isSigningOut = ref(false);
const router = useRouter();

async function signOut() {
  isSigningOut.value = true;
  const { error } = await supabase.auth.signOut();
  router.push("/");
  isSigningOut.value = false;
  if (error) {
    log(error);
  }
}
</script>
