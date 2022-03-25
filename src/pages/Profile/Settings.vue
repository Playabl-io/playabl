<template>
  <ProfileTemplate> Settings </ProfileTemplate>
</template>

<script setup lang="ts">
import { supabase } from "../../supabase";
import { store } from "../../store";
import { onMounted, ref } from "vue";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import {
  BellIcon,
  UserCircleIcon,
  AdjustmentsIcon,
  PhotographIcon,
} from "@heroicons/vue/outline";
import BaseTemplate from "@/components/BaseTemplate.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import {
  subscribeUser,
  unsubscribeUser,
  webPushSubscriptionStore,
} from "@/serviceWorkerRegistration";

const loading = ref(true);
const username = ref("");
const pronouns = ref("");
const avatarUrl = ref("");

async function getProfile() {
  try {
    loading.value = true;
    const user = supabase.auth.user();

    if (!user) return;

    store.user = user;

    const { data, error, status } = await supabase
      .from("profiles")
      .select(`username, pronouns, avatar_url`)
      .eq("id", user.id)
      .single();

    if (error && status !== 406) throw error;

    if (data) {
      username.value = data.username;
      pronouns.value = data.pronouns;
      avatarUrl.value = data.avatar_url;
    }
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

async function updateProfile() {
  try {
    loading.value = true;
    const user = supabase.auth.user();

    if (!user) return;

    store.user = user;

    const updates = {
      id: store.user.id,
      username: username.value,
      pronouns: pronouns.value,
      avatar_url: avatarUrl.value,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates, {
      returning: "minimal", // Don't return the value after inserting
    });

    if (error) throw error;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

async function signOut() {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // getProfile();
});
</script>
