<template>
  <form class="h-full flex flex-col" @submit.prevent="updateGame">
    <div class="grow overflow-auto py-6 px-6 flex flex-col">
      <Heading as="h3" level="h6">Update description</Heading>
      <div class="rounded-md border border-solid border-gray-300 mt-6 grow">
        <TipTapEditor
          v-model="localCopyOfDescription"
          placeholder="Enter a description"
          editor-height="h-full"
          @update:model-value="setFlatDescription"
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
import TipTapEditor from "@/components/TipTapEditor.vue";

const { showError, showSuccess } = useToast();

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
  flatDescription: {
    type: String,
    required: true,
  },
  gameId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const localCopyOfDescription = ref(props.description);
const localCopyOfFlatDescription = ref(props.flatDescription);
const saving = ref(false);

async function updateGame() {
  saving.value = true;
  const { data, error } = await supabase
    .from("games")
    .update({
      description: localCopyOfDescription.value,
      description_as_flat_text: localCopyOfFlatDescription.value,
    })
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

function setFlatDescription(_: string, text: string) {
  localCopyOfFlatDescription.value = text;
}
</script>
