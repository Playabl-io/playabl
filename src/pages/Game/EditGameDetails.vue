<template>
  <form class="h-full flex flex-col" @submit.prevent="handleSave">
    <section class="grow px-6 pt-6 flex flex-col space-y-6">
      <Heading as="h3" level="h6">Update game details</Heading>
      <div class="flex flex-col">
        <FormLabel form="event"> Game event </FormLabel>
        <FormSelect id="event" v-model="selectedEvent">
          <option value="" :selected="!selectedEvent">
            -- Not part of an event --
          </option>
          <option
            v-for="event in events"
            :key="event.id"
            :value="event.id"
            :selected="selectedEvent === event.id"
          >
            {{ event.title }}
          </option>
        </FormSelect>
      </div>
      <div class="flex flex-col">
        <FormLabel for="title" required> Game title </FormLabel>
        <FormInput id="title" v-model="title" required />
      </div>
      <div class="flex flex-col">
        <FormLabel for="system" required> Game system </FormLabel>
        <FormInput id="system" v-model="system" required />
      </div>
      <div class="flex flex-col">
        <FormLabel for="participantCount" required> Player count </FormLabel>
        <FormInput
          id="participantCount"
          v-model.number="participantCount"
          type="number"
          min="1"
          required
        />
      </div>
      <div class="flex flex-col">
        <FormLabel for="tabletop"> Virtual tabletop </FormLabel>
        <FormInput id="tabletop" v-model="tabletop" />
      </div>
      <Well>
        <div class="flex items-center space-x-2">
          <FormCheckbox id="recording" v-model="isRecorded" />
          <FormLabel class="font-normal" for="recording" no-margin>
            This game may be recorded
          </FormLabel>
        </div>
        <div class="mt-4 flex items-center space-x-2">
          <FormCheckbox id="safety" v-model="usesSafetyTools" />
          <FormLabel class="font-normal" for="safety" :no-margin="true">
            This game will use safety tools
          </FormLabel>
        </div>
      </Well>
    </section>
    <div
      class="flex justify-end space-x-4 p-6 border-t border-solid border-gray-300"
    >
      <OutlineButton type="button" @click="emit('close')">Cancel</OutlineButton>
      <PrimaryButton :is-loading="saving">Update</PrimaryButton>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getUpcomingCommunityEvents } from "@/api/communityEvents";
import Heading from "@/components/Heading.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import Well from "@/components/Well.vue";
import { gameStore } from "./gameStore";

import useToast from "@/components/Toast/useToast";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { CommunityEvent } from "@/typings/CommunityEvent";

const { showError, showSuccess } = useToast();

const emit = defineEmits(["close"]);

const title = ref(gameStore.game?.title);
const system = ref(gameStore.game?.system);
const tabletop = ref(gameStore.game?.virtual_tabletop);
const participantCount = ref<number>(gameStore.game?.participant_count || 0);
const isRecorded = ref(gameStore.game?.will_be_recorded || false);
const usesSafetyTools = ref(gameStore.game?.uses_safety_tools || false);
const events = ref<CommunityEvent[]>([]);
const selectedEvent = ref(gameStore.game.community_events?.id);

const saving = ref(false);

onMounted(async () => {
  const data = await getUpcomingCommunityEvents({
    id: gameStore.game.community_id,
    draftState: ["DRAFT", "PUBLISHED"],
  });
  if (data) {
    events.value = data;
  }
});

async function handleSave() {
  if (!gameStore.game?.id) return;
  saving.value = true;
  const { data, error } = await supabase
    .from("games")
    .update({
      title: title.value,
      system: system.value,
      virtual_tabletop: tabletop.value,
      participant_count: participantCount.value,
      will_be_recorded: isRecorded.value,
      uses_safety_tools: usesSafetyTools.value,
      event_id: selectedEvent.value ? selectedEvent.value : null,
    })
    .eq("id", gameStore.game.id)
    .select()
    .single();
  if (error) {
    showError({ message: "Something went wrong" });
    log({ error });
    saving.value = false;
    return;
  }

  if (participantCount.value !== gameStore.game.participant_count) {
    await Promise.all(
      gameStore.sessions.map(async (session) => {
        await supabase
          .from("sessions")
          .update({
            participant_count: participantCount.value,
          })
          .match({ id: session.id });
        await supabase.rpc("set_session_opening", { session_id: session.id });
      })
    );
  }
  data.community_events = events.value.find(
    (event) => event.id === data.event_id
  );
  gameStore.game = data;

  showSuccess({ message: "Details updated" });
  emit("close");
}
</script>
