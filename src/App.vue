<template>
  <router-view></router-view>
  <Toaster />
</template>
<script setup lang="ts">
import { store } from "./store";
import { supabase } from "./supabase";
import Toaster from "./components/Toast/Toaster.vue";
import { useRoute, useRouter } from "vue-router";

const user = supabase.auth.user();

if (user) {
  store.user = user;
}

const route = useRoute();
const router = useRouter();
const redirect = route.query.redirect;

supabase.auth.onAuthStateChange((event, session) => {
  if (session !== null && session.user) {
    store.user = session.user;
    if (redirect) {
      if (redirect && typeof redirect === "string") {
        router.push(redirect);
      }
    }
  }
  if (event === "SIGNED_OUT") {
    store.user = null;
  }
});
</script>
