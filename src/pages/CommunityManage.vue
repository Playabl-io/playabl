<template>
  <section>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 settings-grid">
      <section class="[grid-area:info] section-container">
        <Heading level="h6" as="h2" class="mb-4">Community Info</Heading>
        <GhostButton class="w-full">Edit community info</GhostButton>
      </section>
      <section class="[grid-area:members] section-container">
        <Heading level="h6" as="h2" class="mb-4">Members</Heading>
        <p class="prose dark:prose-invert prose-sm">
          {{ membersCount }} members
        </p>
        <GhostButton class="w-full">Manage and invite members</GhostButton>
      </section>
      <section class="[grid-area:settings] section-container">
        <Heading level="h6" as="h2" class="mb-4">Settings</Heading>
        <AccessLevelList />
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
import { Community } from "@/typings/Community";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import AccessLevelList from "@/components/community/AccessLevelList.vue";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});
toRefs(props);

const route = useRoute();
const loading = ref(true);

const members = ref<{ email: string; id: string }[]>([]);
const membersCount = ref(0);

onMounted(async () => {
  loading.value = true;
  getMembers();
  loading.value = false;
});

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
<style scoped>
.settings-grid {
  grid-template-areas: "info info info settings settings" "members members members settings settings";
}

.section-container {
  @apply border border-solid border-gray-300 p-4 rounded-lg;
}
</style>
