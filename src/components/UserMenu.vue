<template>
  <loading-spinner v-if="isSigningOut" color="white" />
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
          <MenuItem
            v-if="store.userEnabledFlags[flags.flags_ui]"
            v-slot="{ active }"
          >
            <router-link
              :class="{ [activeMenuItem]: active }"
              class="px-2 py-1 rounded-md w-full text-right"
              to="/flags"
            >
              Flags
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
          <hr class="my-2 w-full" />
          <MenuItem
            class="w-full flex justify-end px-2 py-1 rounded-md hover:bg-gray-100"
          >
            <a
              href="https://docs.playabl.io"
              target="_blank"
              class="flex items-center"
            >
              Docs
              <ArrowTopRightOnSquareIcon class="h-5 w-5 ml-1" />
            </a>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
    <div v-else class="flex gap-3 items-center">
      <PrimaryButton class="whitespace-nowrap" @click="signUpMode = 'sign-up'"
        >Sign Up</PrimaryButton
      >
      <LinkButton class="whitespace-nowrap" @click="signUpMode = 'sign-in'">
        Sign in
      </LinkButton>
    </div>
  </section>
  <SignUpModal
    v-if="signUpMode === 'sign-up'"
    open
    @signed-in="signUpMode = 'closed'"
    @cancel="signUpMode = 'closed'"
  />
  <SignUpModal
    v-if="signUpMode === 'sign-in'"
    open
    initial-form="sign-in"
    @signed-in="signUpMode = 'closed'"
    @cancel="signUpMode = 'closed'"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";
import { store } from "../store";
import { unreadNotifications } from "@/util/notifications";
import LoadingSpinner from "./LoadingSpinner.vue";
import { log } from "@/util/logger";
import UserAvatar from "./UserAvatar.vue";
import flags from "@/util/flags";
import PrimaryButton from "./Buttons/PrimaryButton.vue";
import SignUpModal from "./Modals/SignUpModal.vue";
import LinkButton from "./Buttons/LinkButton.vue";

const activeMenuItem = "bg-gray-100 cursor-pointer";

const signUpMode = ref<"sign-up" | "sign-in" | "closed">("closed");
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
