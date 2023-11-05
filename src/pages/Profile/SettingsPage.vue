<template>
  <ProfileTemplate>
    <div class="flex flex-col gap-12">
      <div
        v-if="store.userSession?.user.app_metadata.provider?.includes('email')"
        class="flex flex-col"
      >
        <Heading level="h6" as="h3" class="mb-6">Account settings</Heading>
        <LinkButton class="mr-auto" to="/reset-password">
          Update your password
        </LinkButton>
      </div>
      <div class="flex flex-col">
        <Heading level="h6" as="h3" class="mb-6">Email settings</Heading>
        <fieldset :disabled="emailsEnabled === false">
          <p class="mb-4">Email me when...</p>
          <div class="grid gap-2">
            <FormLabel class="flex items-center gap-2 font-normal" no-margin>
              <FormCheckbox v-model="unreadNotificationEmailsEnabled" />
              I have unread notifications from that day
            </FormLabel>
            <FormLabel class="flex items-center gap-2 font-normal" no-margin>
              <FormCheckbox v-model="rsvpToMyGameEmailsEnabled" />
              Someone joins my game
            </FormLabel>
            <FormLabel class="flex items-center gap-2 font-normal" no-margin>
              <FormCheckbox v-model="communityAdminEmailsEnabled" />
              There are notifications for communities I manage
            </FormLabel>
          </div>
        </fieldset>
        <PrimaryButton
          :is-loading="saving"
          class="mt-6 mr-auto"
          @click="updateEmailSettings"
        >
          Update email settings
        </PrimaryButton>
      </div>
      <div class="flex flex-col">
        <Heading level="h6" as="h3" class="mb-6">User preferences</Heading>
        <div class="mb-3">
          <FormLabel no-margin>Time of Day </FormLabel>
          <p class="text-xs mt-1">
            You can set a start and end time to help identify sessions and games
            that occur during your preferred times. You can also set this from
            the games browse page.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold">Start time</p>
            <FormInput v-model="starttime" type="time" />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold">End time</p>
            <FormInput v-model="endtime" type="time" />
          </div>
        </div>
        <SecondaryButton
          v-if="store.user"
          class="mt-4 mr-auto"
          @click="setUserSettings"
        >
          Update preferences
        </SecondaryButton>
      </div>
    </div>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { supabase } from "@/supabase";
import { ref, watch } from "vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import ProfileTemplate from "@/layouts/ProfileTemplate.vue";
import { updateProfile } from "@/api/profiles";
import Heading from "@/components/Heading.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";

const { showSuccess, showError } = useToast();

const starttime = ref(store.user?.user_settings?.starttime);
const endtime = ref(store.user?.user_settings?.endtime);

const emailsEnabled = ref(
  store.user?.email_preferences?.email_enabled ?? false,
);
const unreadNotificationEmailsEnabled = ref(
  store.user?.email_preferences?.unread_notifications_enabled ?? false,
);
const rsvpToMyGameEmailsEnabled = ref(
  store.user?.email_preferences?.rsvp_to_my_game_enabled ?? false,
);
const communityAdminEmailsEnabled = ref(
  store.user?.email_preferences?.send_community_admin_messages ?? false,
);
const saving = ref(false);

watch(
  () => emailsEnabled.value,
  (newVal) => {
    if (newVal === false) {
      unreadNotificationEmailsEnabled.value = false;
      rsvpToMyGameEmailsEnabled.value = false;
      communityAdminEmailsEnabled.value = false;
    }
  },
);

async function updateEmailSettings() {
  if (!store.user?.id) return;
  saving.value = true;
  const updated = {
    email_enabled: emailsEnabled.value,
    unread_notifications_enabled: unreadNotificationEmailsEnabled.value,
    rsvp_to_my_game_enabled: rsvpToMyGameEmailsEnabled.value,
    send_community_admin_messages: communityAdminEmailsEnabled.value,
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

async function setUserSettings() {
  const update = {
    ...store.userSettings,
    starttime: starttime.value,
    endtime: endtime.value,
  };
  if (store?.user?.id) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          user_settings: update,
        })
        .eq("id", store.user.id);
      store.user.user_settings = update;
      if (error) {
        throw error;
      }
      showSuccess({ message: "Time preference saved" });
    } catch (error) {
      showError({ message: "Unable to save user settings" });
    }
  }
}
</script>
