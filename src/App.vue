<template>
  <AppShell>
    <router-view></router-view>
    <ToasterManager />
    <NewProfileModal
      :open="showNewProfileModal"
      @close="showNewProfileModal = false"
    />
    <OfflineIndicator />
    <ChangelogWidget />
  </AppShell>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { store } from "./store";
import { triggerUserAccessLoad } from "./storeActions";
import { supabase } from "./supabase";
import ToasterManager from "./components/Toast/ToasterManager.vue";
import NewProfileModal from "./components/Modals/NewProfileModal.vue";
import OfflineIndicator from "./components/OfflineIndicator.vue";
import { loadProfile } from "./api/profiles";
import { log } from "./util/logger";
import AppShell from "./layouts/AppShell.vue";
import { Notification } from "./typings/Notification";
import ChangelogWidget from "./ChangelogWidget.vue";
import { Session, Subscription } from "@supabase/supabase-js";
import { isDefined } from "@vueuse/core";

const route = useRoute();
const router = useRouter();
/**
 * Signals we are loading user data in the background. Used to prevent
 * multiple loads happening simultaneously because INITIAL_SESSION and
 * SIGNED_IN can fire in close timing
 */
const loadInProgress = ref(false);
const notificationSubscription = ref();
const supabaseSubscription = ref<Subscription>();

const showNewProfileModal = computed(() => {
  return (
    store.authState === "signedin" &&
    isDefined(store.user?.id) &&
    !isDefined(store.user?.username)
  );
});

async function setupUserProfile(id: string) {
  const profile = await loadProfile(id);
  if (!profile) {
    supabase.auth.signOut();
    removeUser();
    return;
  }
  store.user = profile;
  store.userSettings = profile?.user_settings;
  loadInProgress.value = false;
  store.authState = "signedin";
}

function handleUserInit(session: Session) {
  if (loadInProgress.value) return;
  loadInProgress.value = true;
  setupUserProfile(session.user.id);
  triggerUserAccessLoad(session.user.id);
  getFlags(session.user.id);
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
}

function removeUser() {
  store.user = null;
  store.userSession = null;
  store.authState = "signedout";
  loadInProgress.value = false;
}

onMounted(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    const now = new Date();
    switch (event) {
      case "PASSWORD_RECOVERY":
        store.userSession = session;
        router.replace("/reset-password");
        break;
      case "SIGNED_OUT":
        removeUser();
        break;
      case "INITIAL_SESSION":
        if (session === null) {
          removeUser();
        } else if (
          session.expires_at &&
          session.expires_at * 1000 > now.getTime()
        ) {
          store.userSession = session;
          handleUserInit(session);
        }
        break;
      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
        if (!session) {
          removeUser();
          break;
        }
        store.userSession = session;
        if (store.user?.id !== session?.user?.id) {
          handleUserInit(session);
        }
    }
  });
  supabaseSubscription.value = subscription;
});

onUnmounted(() => {
  supabaseSubscription.value?.unsubscribe();
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
          payload.new as Notification
        );
      }
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
      }
    )
    .subscribe();
  notificationSubscription.value = subscription;
}

async function getFlags(id: string) {
  const { data } = await supabase
    .from("flags")
    .select("*")
    .contains("user_ids", [id]);
  if (data) {
    data.forEach(({ flag }) => {
      store.userEnabledFlags[flag] = true;
    });
  }
}
</script>
