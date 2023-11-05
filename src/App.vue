<template>
  <AppShell>
    <div v-if="loadingUser" class="grow grid place-content-center">
      <LoadingSpinner color="brand-500" />
    </div>
    <router-view v-else></router-view>
    <ToasterManager />
    <NewProfileModal
      :open="showNewProfileModal"
      @close="showNewProfileModal = false"
    />
    <OfflineIndicator />
    <div
      v-if="store.user && !shownDashboardAnnouncement"
      class="z-50 fixed inset-x-0 mx-2 md:mx-auto w-fit rounded-xl bottom-6 p-6 bg-teal-200 text-teal-900 flex items-center gap-3 max-w-4xl"
    >
      <DismissButton
        label="dismiss notification"
        class="absolute top-2 right-2"
        @click="shownDashboardAnnouncement = true"
      />
      <div class="grid grid-cols-6 gap-6">
        <img
          v-if="isSmAndLarger"
          src="/public/images/task_done.png"
          class="w-full"
        />
        <div
          class="flex flex-col justify-center gap-2 col-span-full sm:col-span-5 sm:text-right"
        >
          <p class="md:text-lg font-semibold">
            You're personal view of your next week of gaming is now available!
          </p>
          <p>
            <router-link
              to="/#welcome"
              class="text-blue-700 underline"
              @click="shownDashboardAnnouncement = true"
              >Check it out now</router-link
            >, or any time on the home page.
          </p>
        </div>
      </div>
    </div>
  </AppShell>
</template>
<script setup lang="ts">
import { store } from "./store";
import { getUserAccess, getUserMemberships } from "./storeActions";
import { supabase } from "./supabase";
import ToasterManager from "./components/Toast/ToasterManager.vue";
import { useRoute, useRouter } from "vue-router";
import NewProfileModal from "./components/Modals/NewProfileModal.vue";
import OfflineIndicator from "./components/OfflineIndicator.vue";
import { onMounted, ref } from "vue";
import { loadProfile } from "./api/profiles";
import { log } from "./util/logger";
import AppShell from "./layouts/AppShell.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { Notification } from "./typings/Notification";
import { useStorage, breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import DismissButton from "./components/Buttons/DismissButton.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const shownDashboardAnnouncement = useStorage("dashboard-announcement", false);
const route = useRoute();
const router = useRouter();

const showNewProfileModal = ref(false);
const loadingUser = ref(true);
const notificationSubscription = ref();

supabase.auth.onAuthStateChange(async (event, session) => {
  switch (event) {
    case "SIGNED_IN":
    case "TOKEN_REFRESHED":
      if (session !== null && session.user) {
        store.userSession = session;
        const profile = await loadProfile(session.user.id);
        if (!profile) {
          supabase.auth.signOut();
          break;
        }
        store.user = profile;
        store.userSettings = profile.user_settings;

        if (!notificationSubscription.value) {
          loadNotificationsAndSubscribe();
        }

        if (route.query.redirect && typeof route.query.redirect === "string") {
          log({
            level: "info",
            message: `Attempting redirect to ${route.query.redirect}`,
          });
          router.push(route.query.redirect);
        }

        if (!profile.username && !profile.pronouns) {
          showNewProfileModal.value = true;
        }
      }
      break;
    case "SIGNED_OUT":
      store.user = null;
      store.userSession = null;
      break;
  }
});

async function loadNotificationsAndSubscribe() {
  if (!store.user?.id) return;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("read", false)
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    store.notifications = data;
  }
  const subscription = supabase
    .channel(`public:notifications:user_id=eq.${store.user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${store.user.id}`,
      },
      (payload) => {
        store.notifications = store.notifications.concat(
          payload.new as Notification,
        );
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${store.user.id}`,
      },
      (payload) => {
        store.notifications = store.notifications.map((notification) => {
          if (notification.id === payload.new.id) {
            return payload.new as Notification;
          }
          return notification;
        });
      },
    )
    .subscribe();
  notificationSubscription.value = subscription;
}

onMounted(async () => {
  const user = await supabase.auth.getUser();
  if (user.error) {
    // No logged in user
    loadingUser.value = false;
  }
  if (user.data?.user?.id) {
    await Promise.all([
      getUserAccess(user.data.user.id),
      getUserMemberships(user.data.user.id),
    ]);
    const { data } = await supabase
      .from("flags")
      .select("*")
      .contains("user_ids", [user.data.user.id]);
    if (data) {
      data.forEach(({ flag }) => {
        store.userEnabledFlags[flag] = true;
      });
    }
  }
  loadingUser.value = false;
});
</script>
