<template>
  <header>
    <Menu>
      <MenuButton class="m-2 p-2 relative">
        <Bars3Icon class="text-slate-900 dark:text-slate-100 h-6 w-6" />
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
            class="absolute -bottom-2 -right-2 h-5 w-5 grid place-content-center bg-blue-200 text-blue-700 text-xs font-semibold p-1 rounded-full"
          >
            {{ unreadNotifications.length }}
          </div>
        </transition>
      </MenuButton>
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-x-full opacity-0"
        enter-to-class="transform opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform opacity-100"
        leave-to-class="transform -translate-x-full opacity-0"
      >
        <MenuItems
          class="fixed left-0 inset-y-0 w-1/2 flex flex-col space-y-4 bg-gray-50 rounded-r-sm text-slate-900 p-4 z-20 shadow-lg"
        >
          <MenuButton class="absolute top-4 right-4 p-2">
            <ArrowLeftOnRectangleIcon
              class="text-slate-900 dark:text-slate-100 h-6 w-6"
            />
          </MenuButton>
          <menu-item>
            <router-link to="/" class="font-paytone text-lg p-2 mt-12">
              Playabl
            </router-link>
          </menu-item>
          <Disclosure as="div" class="text-left px-2 py-1">
            <DisclosureButton> Communities </DisclosureButton>
            <DisclosurePanel
              class="pt-3 pl-2 flex flex-col gap-3 font-semibold text-blue-700"
            >
              <RouterLink v-if="store.user" to="/communities/joined">
                Joined
              </RouterLink>
              <RouterLink
                to="/communities/browse?sort.key=member-count&sort.dir=desc"
              >
                Browse
              </RouterLink>
              <RouterLink v-if="store.user" to="/communities/manage">
                Manage
              </RouterLink>
              <RouterLink to="/communities/new"> Create New </RouterLink>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure as="div" class="text-left px-2 py-1">
            <DisclosureButton> Games </DisclosureButton>
            <DisclosurePanel
              class="pt-3 pl-2 flex flex-col gap-3 font-semibold text-blue-700"
            >
              <RouterLink v-if="store.user" to="/games/joined">
                Joined
              </RouterLink>
              <RouterLink to="/games/browse?sort.key=start_time&sort.dir=asc">
                Browse
              </RouterLink>
              <RouterLink v-if="store.user" to="/games/manage">
                Manage
              </RouterLink>
              <RouterLink to="/games/new"> Create New </RouterLink>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure as="div" class="text-left px-2 py-1">
            <DisclosureButton> Events </DisclosureButton>
            <DisclosurePanel
              class="pt-3 pl-2 flex flex-col gap-3 font-semibold text-blue-700"
            >
              <RouterLink to="/events/browse"> Browse </RouterLink>
              <RouterLink to="/events/new"> Create New </RouterLink>
            </DisclosurePanel>
          </Disclosure>

          <hr />
          <menu-item v-if="store.user">
            <router-link
              class="px-2 py-1"
              to="/profile"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Profile
            </router-link>
          </menu-item>
          <menu-item v-if="store.user">
            <router-link
              class="px-2 py-1 flex items-center"
              to="/notifications"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Notifications
              <div
                v-if="store.notifications.length"
                class="ml-2 h-5 w-5 grid place-content-center bg-blue-200 text-blue-700 text-xs font-semibold p-1 rounded-full"
              >
                {{ store.notifications.length }}
              </div>
            </router-link>
          </menu-item>
          <menu-item v-else>
            <router-link
              class="px-2 py-1"
              to="/login"
              active-class="text-brand-500 border-l border-brand-500 dark:border-brand-300"
            >
              Sign in
            </router-link>
          </menu-item>
          <MenuItem class="px-2 py-1 flex items-center">
            <a
              href="https://docs.playabl.io"
              target="_blank"
              class="flex items-center"
            >
              Docs
              <ArrowTopRightOnSquareIcon class="h-5 w-5 ml-1" />
            </a>
          </MenuItem>
          <menu-item v-if="store.user?.id">
            <outline-button @click="signOut">Sign out</outline-button>
          </menu-item>
        </MenuItems>
      </transition>
    </Menu>
  </header>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { supabase } from "@/supabase";
import { RouterLink, useRouter } from "vue-router";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/vue";
import OutlineButton from "../Buttons/OutlineButton.vue";
import { Bars3Icon, ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";
import { store } from "@/store";
import { unreadNotifications } from "@/util/notifications";
import { log } from "@/util/logger";
import { ArrowLeftOnRectangleIcon } from "@heroicons/vue/24/outline";

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
