<template>
  <Modal title="Welcome! Let's get to know you" :open="open">
    <DismissButton
      class="absolute top-4 right-4"
      label="Close"
      @click="emit('close')"
    />
    <div class="my-6">
      <form
        class="grid gap-6 lg:max-w-xl mx-auto"
        @submit.prevent="updateProfile"
      >
        <div class="flex flex-col">
          <form-label for="username" required> Display name </form-label>
          <p class="text-xs text-slate-700">
            The name you would like community members to know you by
          </p>
          <form-input id="username" v-model="username" class="grow" required />
        </div>
        <div class="flex flex-col">
          <form-label for="pronouns" required> Pronouns </form-label>
          <form-input id="pronouns" v-model="pronouns" required />
        </div>
        <div class="flex flex-col">
          <form-label class="flex flex-col" for="avatar"> Avatar </form-label>
          <FormFileInput
            class="mt-2"
            :file="avatar"
            size-limit="1 MB"
            @file-change="onFileChange"
            @file-drop="onFileDrop"
            @clear-file="avatar = undefined"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <OutlineButton type="button" @click="emit('close')">
            Do this later
          </OutlineButton>
          <PrimaryButton :is-loading="loading"> Update profile </PrimaryButton>
        </div>
      </form>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { toRefs, ref } from "vue";
import Modal from "./Modal.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "../Buttons/OutlineButton.vue";
import { supabase } from "@/supabase";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";
import DismissButton from "../Buttons/DismissButton.vue";
import FormFileInput from "../Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import { uploadToAvatarStorage } from "@/api/storage";
import { store } from "@/store";

const { showSuccess, showError } = useToast();

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});
toRefs(props);

const emit = defineEmits(["close"]);

const username = ref("");
const pronouns = ref("");
const avatar = ref<File>();
const loading = ref(false);

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 1000000, label: "1 MB" });
  if (file) {
    avatar.value = file;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 1000000, label: "1 MB" });
  if (file) {
    avatar.value = file;
  }
}

const updateProfile = async () => {
  let imagePath;
  try {
    loading.value = true;
    if (avatar.value) {
      imagePath = await uploadToAvatarStorage(avatar.value);
    }
    const { error } = await supabase
      .from("profiles")
      .update(
        {
          username: username.value,
          pronouns: pronouns.value,
          avatar_url: imagePath,
        },
        { returning: "minimal" }
      )
      .eq("id", store.user?.id);

    if (error) throw error;

    showSuccess({ message: "Profile updated" });
    emit("close");
  } catch (error) {
    showError({ message: error?.error_description || error?.message });
    log({ error });
  } finally {
    loading.value = false;
  }
};
</script>
