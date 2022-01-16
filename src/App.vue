<template>
  <router-view></router-view>
</template>
<script setup lang="ts">
import { store } from "./store";
import { supabase } from "./supabase";

const user = supabase.auth.user();

if (user) {
  store.user = user;
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session !== null && session.user) {
    store.user = session.user;
  }
  if (event === "SIGNED_OUT") {
    store.user = null;
  }
});
</script>
