<template>
  <router-view></router-view>
  <Toaster />
  <NewProfileModal
    :open="showNewProfileModal"
    @close="showNewProfileModal = false"
  />
</template>
<script setup lang="ts">
import { store } from "./store";
import { supabase } from "./supabase";
import Toaster from "./components/Toast/Toaster.vue";
import { useRoute, useRouter } from "vue-router";
import NewProfileModal from "./components/Modals/NewProfileModal.vue";
import { onMounted, ref } from "vue";
import { loadProfile } from "./api/profiles";
import { log } from "./util/logger";
import { Notification } from "./typings/Notification";

const user = supabase.auth.user();

if (user) {
  store.user = user;
}

const route = useRoute();
const router = useRouter();

const showNewProfileModal = ref(false);

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session !== null && session.user) {
    const profile = await loadProfile(session.user.id);
    store.user = profile;
    if (route.query.redirect && typeof route.query.redirect === "string") {
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

async function loadNotifications() {
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
}

onMounted(loadNotifications);
</script>
