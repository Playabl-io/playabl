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
import { onMounted, onUnmounted, ref } from "vue";
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
import { Subscription } from "@supabase/supabase-js";

const route = useRoute();
const router = useRouter();

const showNewProfileModal = ref(false);
const notificationSubscription = ref();
const supabaseSubscription = ref<Subscription>();

async function setupUserProfile(id: string) {
  const profile = await loadProfile(id);
  if (!profile) {
    supabase.auth.signOut();
  }
  store.user = profile;
  store.userSettings = profile.user_settings;

  if (!profile.username && !profile.pronouns) {
    showNewProfileModal.value = true;
  }
}

onMounted(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
        if (session !== null && session.user) {
          store.userSession = session;
          setupUserProfile(session.user.id);
          triggerUserAccessLoad(session.user.id);
          getFlags(session.user.id);
          if (!notificationSubscription.value) {
            loadNotificationsAndSubscribe();
          }

          if (
            route.query.redirect &&
            typeof route.query.redirect === "string"
          ) {
            log({
              level: "info",
              message: `Attempting redirect to ${route.query.redirect}`,
            });
            router.push(route.query.redirect);
          }
        }
        break;
      case "PASSWORD_RECOVERY":
        store.userSession = session;
        router.replace("/reset-password");
        break;
      case "SIGNED_OUT":
        store.user = null;
        store.userSession = null;
        break;
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
