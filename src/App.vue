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
import { ref } from "vue";
import { loadProfile } from "./api/profiles";

const user = supabase.auth.user();

if (user) {
  store.user = user;
}

const route = useRoute();
const router = useRouter();
const redirect = route.query.redirect;

const showNewProfileModal = ref(false);

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session !== null && session.user) {
    const profile = await loadProfile(session.user.id);
    store.user = profile;
    if (redirect) {
      console.log({ redirect });
      if (redirect && typeof redirect === "string") {
        router.push(redirect);
      }
    }
    if (!profile.username && !profile.pronouns) {
      showNewProfileModal.value = true;
    }
  }
  if (event === "SIGNED_OUT") {
    store.user = null;
  }
});
</script>
