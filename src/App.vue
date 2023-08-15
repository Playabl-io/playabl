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
    <MessageBox />
    <OfflineIndicator />
  </AppShell>
</template>
<script setup lang="ts">
import { store } from "./store";
import { getUserAccess, getUserMemberships } from "./storeActions";
import { supabase } from "./supabase";
import ToasterManager from "./components/Toast/ToasterManager.vue";
import MessageBox from "./components/MessageBox/MessageBox.vue";
import { useRoute, useRouter } from "vue-router";
import NewProfileModal from "./components/Modals/NewProfileModal.vue";
import OfflineIndicator from "./components/OfflineIndicator.vue";
import { onMounted, ref } from "vue";
import { loadProfile } from "./api/profiles";
import { log } from "./util/logger";
import AppShell from "./layouts/AppShell.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { Notification } from "./typings/Notification";
import { loadUserManagedCommunities } from "./api/communityMemberships";

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
        store.user = profile;

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

async function setUserManagedCommunitise(userId: string) {
  loadUserManagedCommunities({ userId }).then((response) => {
    store.userManagedCommunities = response;
  });
}

onMounted(async () => {
  const user = await supabase.auth.getUser();
  if (user.error) {
    // No logged in user
    loadingUser.value = false;
  }
  if (user.data?.user?.id) {
    await Promise.all([
      setUserManagedCommunitise(user.data.user.id),
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
