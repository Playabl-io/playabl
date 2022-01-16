<template>
  <base-template>
    <form class="flex flex-col space-y-4" @submit.prevent="updateProfile">
      <div class="flex flex-col">
        <form-label for="email">Email</form-label>
        <p class="prose">{{ store.user.email }}</p>
      </div>
      <div class="flex flex-col">
        <form-label for="username">Name</form-label>
        <form-input id="username" type="text" v-model="username" />
      </div>
      <div class="flex flex-col">
        <form-label for="pronouns">Pronouns</form-label>
        <form-input id="pronouns" v-model="pronouns" />
      </div>

      <div>
        <primary-button type="submit" :disabled="loading">{{
          loading ? "Loading ..." : "Update"
        }}</primary-button>
      </div>

      <div>
        <secondary-button @click="signOut" :disabled="loading"
          >Sign Out</secondary-button
        >
      </div>
    </form>
  </base-template>
</template>

<script setup lang="ts">
import { supabase } from "../supabase";
import { store } from "../store";
import { onMounted, ref } from "vue";
import BaseTemplate from "@/components/BaseTemplate.vue";

const loading = ref(true);
const username = ref("");
const pronouns = ref("");
const avatarUrl = ref("");

async function getProfile() {
  try {
    loading.value = true;
    const user = supabase.auth.user();
    console.log("loaded user", user);

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

    let { error } = await supabase.from("profiles").upsert(updates, {
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
    let { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getProfile();
});
</script>
