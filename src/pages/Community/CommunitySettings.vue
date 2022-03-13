<template>
  <div class="grid settings-grid gap-12">
    <nav>
      <p>Community Info</p>
      <p>Access</p>
    </nav>
    <section>
      <SwitchGroup>
        <div class="flex items-center mt-10 mb-4">
          <SwitchLabel class="text-lg mr-4"> Allow public signup </SwitchLabel>
          <Switch
            v-model="allowPublicSignup"
            :class="
              allowPublicSignup ? 'bg-green-500' : 'bg-gray-300 bg-opacity-70'
            "
            class="relative inline-flex flex-shrink-0 h-[24px] w-[48px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-opacity-75"
          >
            <span
              aria-hidden="true"
              :class="allowPublicSignup ? 'translate-x-6' : 'translate-x-0'"
              class="pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
            />
          </Switch>
        </div>
      </SwitchGroup>
      <p class="text-lg mt-10 mb-1">Cover image</p>
      <FormFileInput
        :current-image="communityStore.coverImageUrl"
        :file="newCoverImage"
        size-limit="3 MB"
        @file-change="onFileChange"
        @file-drop="onFileDrop"
        @clear-file="newCoverImage = undefined"
      />
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { SwitchGroup, SwitchLabel, Switch } from "@headlessui/vue";
import FormFileInput from "@/components/Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import { communityStore } from "./communityStore";

const newCoverImage = ref();
const allowPublicSignup = ref(communityStore.community.allow_public_signup);

const allowSignupValHasChanged = computed(
  () => communityStore.community.allow_public_signup !== allowPublicSignup.value
);

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 3000000, label: "3 MB" });
  if (file) {
    newCoverImage.value = file;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 3000000, label: "3 MB" });
  if (file) {
    newCoverImage.value = file;
  }
}
</script>
<style scoped>
.settings-grid {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .settings-grid {
    grid-template-columns: auto 1fr;
  }
}
</style>
