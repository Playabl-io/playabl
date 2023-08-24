<template>
  <base-template>
    <BrowsePageTemplate
      title="Community"
      allow-create-new
      @create-new="
        router.push({
          path: '/communities/new',
        })
      "
    >
      <template #page-controls>
        <UrlSortDropdown :key-options="keyOptions" />
        <div class="flex flex-col">
          <FormLabel>Game Types</FormLabel>
          <FormMultiSelect v-model="tags" :options="GAME_TAG_OPTIONS" />
        </div>
        <div class="flex flex-col">
          <FormLabel no-margin>Filter</FormLabel>
          <div class="flex items-center gap-2 mt-2 mb-3">
            <FormCheckbox
              id="code-of-conduct"
              v-model="filter"
              value="code-of-conduct"
            />
            <FormLabel for="code-of-conduct" no-margin
              >Has Code of Conduct</FormLabel
            >
          </div>
          <div class="flex items-center gap-2 mb-3">
            <FormCheckbox id="open" v-model="filter" value="open" />
            <FormLabel for="open" no-margin>Is Open Access</FormLabel>
          </div>
        </div>
      </template>
      <template #content>
        <CommunitiesListing
          :is-loading="isLoading"
          :communities="communities"
        />
      </template>
    </BrowsePageTemplate>
  </base-template>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRouteQuery } from "@vueuse/router";
import * as R from "ramda";
import { supabase } from "@/supabase";
import BaseTemplate from "@/layouts/BaseTemplate.vue";
import BrowsePageTemplate from "@/layouts/BrowsePageTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import CommunitiesListing from "@/components/CommunitiesListing.vue";
import UrlSortDropdown from "@/components/Search/UrlSortDropdown.vue";
import { CommunityBrowse, SignupMethods } from "@/typings/Community";
import { log } from "@/util/logger";
import {
  SORT_DIR,
  SORT_DIR_PATH,
  SORT_KEY,
  SORT_KEY_PATH,
  sortKeys,
  sortDirs,
  ensureRouteQueryIsArray,
} from "@/util/urlParams";
import FormMultiSelect from "@/components/Forms/FormMultiSelect.vue";
import { GAME_TAG_OPTIONS } from "@/util/gameSystemList";

const route = useRoute();
const router = useRouter();
const filter = useRouteQuery("filter", [] as string[], {
  transform: ensureRouteQueryIsArray,
});
const tags = useRouteQuery("tags", [] as string[], {
  transform: ensureRouteQueryIsArray,
});

const isLoading = ref(false);
const communities = ref<CommunityBrowse[]>([]);

const MEMBER_COUNT_SORT_KEY = "member-count";

const keyOptions = [
  {
    label: "Member Count",
    value: MEMBER_COUNT_SORT_KEY,
  },
  {
    label: "Created At",
    value: sortKeys.createdAt,
  },
];

onMounted(loadCommunities);

const sortByMemberCount = R.sortBy(
  (community: CommunityBrowse) => community.community_memberships[0]?.count
);

async function loadCommunities() {
  const sortKey = route.query[SORT_KEY_PATH];
  const sortDir = route.query[SORT_DIR_PATH] as SORT_DIR;

  isLoading.value = true;
  const query = supabase
    .from("communities")
    .select("*, community_memberships (count)")
    .is("deleted_at", null);
  if (filter.value.includes("code-of-conduct")) {
    query.neq("code_of_conduct_url", "");
  }
  if (filter.value.includes("open")) {
    query.eq("signup_method", SignupMethods.PUBLIC);
  }
  if (tags.value.length > 0) {
    query.contains("game_types", tags.value);
  }

  if (sortKey === sortKeys.createdAt) {
    query.order(sortKey, { ascending: sortDir === sortDirs.asc });
  }

  const { data, error } = await query;
  if (error) {
    log({ error });
  }
  if (data) {
    if (sortKey === MEMBER_COUNT_SORT_KEY) {
      // sort by member count
      const ascending = sortByMemberCount(data);
      communities.value =
        sortDir === sortDirs.asc ? ascending : ascending.reverse();
    } else {
      communities.value = data;
    }
  }
  isLoading.value = false;
}

watch([route], () => {
  loadCommunities();
});
</script>
