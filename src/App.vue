<template>
  <AppShell>
    <router-view></router-view>
    <ToasterManager />
    <NewProfileModal
      :open="showNewProfileModal"
      @close="showNewProfileModal = false"
    />
    <MessageBox />
    <OfflineIndicator />
  </AppShell>
</template>
<script setup lang="ts">
import { store } from "./store";
import { supabase } from "./supabase";
import ToasterManager from "./components/Toast/ToasterManager.vue";
import MessageBox from "./components/MessageBox/MessageBox.vue";
import { useRoute, useRouter } from "vue-router";
import NewProfileModal from "./components/Modals/NewProfileModal.vue";
import OfflineIndicator from "./components/OfflineIndicator.vue";
import { onMounted, ref } from "vue";
import { loadProfile } from "./api/profiles";
import { log } from "./util/logger";
import { Notification } from "./typings/Notification";
import AppShell from "./layouts/AppShell.vue";

const user = supabase.auth.user();
if (user) {
  store.user = {
    id: user.id,
    email: user.email || "",
  };
}

const route = useRoute();
const router = useRouter();

const showNewProfileModal = ref(false);

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session !== null && session.user) {
    const profile = await loadProfile(session.user.id);
    store.user = profile;
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
  if (event === "SIGNED_OUT") {
    store.user = null;
  }
});

async function loadNotificationsAndSubscribe() {
  if (!store.user?.id) return;
  const { data, error } = await supabase
    .from<Notification>("notifications")
    .select("*")
    .eq("read", false)
    .eq("user_id", store.user.id);
  if (error) {
    log({ error });
  }
  if (data) {
    store.notifications = data;
  }
  supabase
    .from(`notifications:user_id=eq.${store.user.id}`)
    .on("INSERT", (payload) => {
      store.notifications = store.notifications.concat(payload.new);
    })
    .on("UPDATE", (payload) => {
      store.notifications = store.notifications.map((notification) => {
        if (notification.id === payload.new.id) {
          return payload.new;
        }
        return notification;
      });
    })
    .subscribe();
}

onMounted(loadNotificationsAndSubscribe);
</script>
