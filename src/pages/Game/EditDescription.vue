<template>
  <form class="h-full flex flex-col" @submit.prevent="updateGame">
    <div class="grow overflow-auto pt-6 px-6">
      <Heading as="h3" level="h6">Update description</Heading>
      <div class="rounded-md border border-solid border-gray-300 mt-6">
        <QuillEditor
          v-model:content="localCopyOfDescription"
          theme="bubble"
          toolbar="essential"
        />
      </div>
    </div>
    <div
      class="grow-0 flex justify-end space-x-4 bg-inherit p-6 border-t border-solid border-gray-200"
    >
      <OutlineButton type="button" @click="emit('close')">
        Cancel
      </OutlineButton>
      <PrimaryButton :is-loading="saving">Save</PrimaryButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { supabase } from "@/supabase";
import Heading from "@/components/Heading.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { gameStore } from "./gameStore";
import useToast from "@/components/Toast/useToast";

const { showError, showSuccess } = useToast();

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
  gameId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const localCopyOfDescription = ref(JSON.parse(props.description));
const saving = ref(false);

async function updateGame() {
  saving.value = true;
  const { data, error } = await supabase
    .from("games")
    .update({ description: JSON.stringify(localCopyOfDescription.value) })
    .eq("id", props.gameId)
    .single();
  if (error) {
    showError({ message: "Something went wrong" });
    saving.value = false;
    return;
  }
  gameStore.game = data;
  showSuccess({ message: "Description saved" });
  emit("close");
}
</script>
