<template>
  <ProfileTemplate>
    <div class="flex flex-col">
      <Heading level="h6" as="h3" class="mb-6">Email settings</Heading>
      <!-- <FormLabel class="flex items-center gap-2 font-normal mb-3" no-margin>
        <FormCheckbox v-model="emailsEnabled" />
        Receive email notifications
      </FormLabel> -->
      <fieldset :disabled="emailsEnabled === false">
        <p class="mb-4">Email me when...</p>
        <FormLabel class="flex items-center gap-2 font-normal mb-2" no-margin>
          <FormCheckbox v-model="unreadNotificationEmailsEnabled" />
          I have unread notifications from that day
        </FormLabel>
        <FormLabel class="flex items-center gap-2 font-normal" no-margin>
          <FormCheckbox v-model="rsvpToMyGameEmailsEnabled" />
          Someone joins my game
        </FormLabel>
      </fieldset>
      <PrimaryButton
        :is-loading="saving"
        class="mt-6 mr-auto"
        @click="updateEmailSettings"
      >
        Update email settings
      </PrimaryButton>
    </div>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import { store } from "@/store";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import ProfileTemplate from "@/components/ProfileTemplate.vue";
import { updateProfile } from "@/api/profiles";
import useToast from "@/components/Toast/useToast";
import Heading from "@/components/Heading.vue";

const { showSuccess, showError } = useToast();

const emailsEnabled = ref(
  store.user?.email_preferences?.email_enabled ?? false
);
const unreadNotificationEmailsEnabled = ref(
  store.user?.email_preferences?.unread_notifications_enabled ?? false
);
const rsvpToMyGameEmailsEnabled = ref(
  store.user?.email_preferences?.rsvp_to_my_game_enabled ?? false
);
const saving = ref(false);

watch(
  () => emailsEnabled.value,
  (newVal) => {
    if (newVal === false) {
      unreadNotificationEmailsEnabled.value = false;
      rsvpToMyGameEmailsEnabled.value = false;
    }
  }
);

async function updateEmailSettings() {
  if (!store.user?.id) return;
  saving.value = true;
  const updated = {
    email_enabled: emailsEnabled.value,
    unread_notifications_enabled: unreadNotificationEmailsEnabled.value,
    rsvp_to_my_game_enabled: rsvpToMyGameEmailsEnabled.value,
  };
  try {
    await updateProfile({
      userId: store.user.id,
      update: {
        email_preferences: updated,
      },
    });
    showSuccess({ message: "Email settings updated!" });
    store.user.email_preferences = updated;
  } catch (error) {
    showError({ message: "Unable to update email settings" });
  } finally {
    saving.value = false;
  }
}
</script>
