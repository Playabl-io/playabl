<template>
  <!-- <div v-if="route.query.display_success_banner">
      <Heading level="h2">Success!</Heading>
      <p class="prose prose-lg dark:prose-invert">
        Your community has been created!
      </p>
    </div> -->
  <section>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section>
        <Heading level="h6" as="h2" class="mb-4">Members</Heading>
        <p class="prose dark:prose-invert prose-sm">
          {{ membersCount }} members
        </p>
        <GhostButton class="w-full">Manage and invite members</GhostButton>
      </section>
      <section>
        <Heading level="h6" as="h2" class="mb-4">Community Info</Heading>
        <GhostButton class="w-full">Edit community info</GhostButton>
      </section>
      <section>
        <Heading level="h6" as="h2" class="mb-4">Settings</Heading>
      </section>
    </div>
  </section>
</template>
<script setup lang="ts">
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { ref, onMounted, PropType, toRefs } from "vue";
import { useRoute } from "vue-router";
import Heading from "@/components/Heading.vue";
import { ADMIN, PLAYER } from "@/util/roles";
import { store } from "@/store";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { AccessLevel } from "@/typings/AccessLevel";
import { Community } from "@/typings/Community";
import GhostButton from "@/components/Buttons/GhostButton.vue";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});
toRefs(props);

const route = useRoute();
const loading = ref(true);

const accessLevels = ref([] as AccessLevel[]);
const members = ref([] as { email: string; id: string }[]);
const membersCount = ref(0);

onMounted(async () => {
  loading.value = true;
  getAccessLevels();
  getMembers();
  loading.value = false;
});

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
  const { data, error, count } = await supabase
    .from("community_memberships")
    .select("role_id (name), user_id (username, id)", { count: "exact" })
    .eq("community_id", route.params.community_id);
  if (count) {
    membersCount.value = count;
  }
  if (data) {
    members.value = data.map((membership) => ({
      ...membership.role_id,
      ...membership.user_id,
    }));
  }
  if (error) {
    log({ error });
  }
}
</script>
