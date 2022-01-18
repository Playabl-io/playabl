<template>
  <BaseTemplate>
    <div v-if="route.query.display_success_banner">
      <Heading level="h2">Success!</Heading>
      <p class="prose prose-lg dark:prose-invert">
        Your community has been created!
      </p>
    </div>
    <LoadingSpinner v-if="loading" color="brand-500" />
    <section v-else-if="isNotPermissioned">
      <p class="prose dark:prose-invert prose-xl">
        You don't have permission to manage this community
      </p>
    </section>
    <section v-else>
      <Heading level="h1" class="mb-12">
        {{ name }}
      </Heading>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section>
          <Heading level="h6" as="h2">Members</Heading>
          <div v-for="member in members" :key="member.id">
            {{ JSON.stringify(member) }}
          </div>
        </section>
        <section>
          <Heading level="h6" as="h2">Info</Heading>
          <p>
            {{ description }}
          </p>
          <p>
            {{ website }}
          </p>
          <p>
            {{ twitter }}
          </p>
          <p>
            {{ facebook }}
          </p>
        </section>
        <section>
          <Heading level="h6" as="h2">Settings</Heading>
        </section>
      </div>
    </section>
    <PrimaryButton @click="addMember">Add member</PrimaryButton>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import BaseTemplate from "@/components/BaseTemplate.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Heading from "@/components/Heading.vue";
import { ADMIN, PLAYER } from "@/util/roles";
import { store } from "@/store";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { AccessLevel } from "@/typings/AccessLevel";

const route = useRoute();
const loading = ref(true);

const isOwner = ref(false);
const isAdmin = ref(false);
const isNotPermissioned = ref(false);

const name = ref("");
const description = ref("");
const website = ref("");
const twitter = ref("");
const facebook = ref("");
const allowPublicAccess = ref(false);
const accessLevels = ref([] as AccessLevel[]);
const members = ref([] as { email: string; id: string }[]);

onMounted(async () => {
  loading.value = true;
  await getCommunity();
  if (!isOwner.value) {
    await getAdminStatus();
    if (!isAdmin.value) {
      isNotPermissioned.value = true;
      return;
    }
  }
  getAccessLevels();
  getMembers();
  loading.value = false;
});

async function getAdminStatus() {
  const { data } = await supabase
    .from("community_memberships")
    .select(`profile_id`)
    .eq("community_id", route.params.community_id)
    .eq("role_id", ADMIN)
    .eq("profile_id", store.user.id)
    .single();
  if (data) {
    isAdmin.value = true;
  }
}

async function getCommunity() {
  const { data, error, status } = await supabase
    .from("communities")
    .select(
      `name, description, website, twitter, facebook, allow_public_access, owner_id`
    )
    .eq("id", route.params.community_id)
    .single();

  if (error && status !== 406) {
    log({ error });
  }

  if (data) {
    name.value = data.name;
    description.value = data.description;
    website.value = data.website;
    twitter.value = data.twitter;
    facebook.value = data.facebook;
    allowPublicAccess.value = data.allow_public_access;

    if (data.owner_id === store.user.id) {
      isOwner.value = true;
    }
  }
}

async function getAccessLevels() {
  const { data } = await supabase
    .from("access_levels")
    .select("name, priority_access_time, id")
    .eq("community_id", route.params.community_id);
  if (data) {
    accessLevels.value = data;
  }
}

async function addMember() {
  const { data, error } = await supabase.from("community_memberships").insert({
    user_id: "77442c21-1084-467e-9775-372f7e942162",
    community_id: route.params.community_id,
    access_level_id: 1,
    role_id: PLAYER,
  });
}

async function getMembers() {
  const { data, error } = await supabase
    .from("community_memberships")
    .select("role_id (name), user_id (username, id)")
    .eq("community_id", route.params.community_id);
  if (data) {
    members.value = data;
  }
}
</script>
