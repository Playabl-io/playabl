<template>
  <ProfileTemplate>
    <div class="flex flex-col gap-12">
      <div
        v-if="store.userSession?.user.app_metadata.provider?.includes('email')"
        class="flex flex-col"
      >
        <Heading level="h6" as="h3" class="mb-6">Account settings</Heading>
        <PrimaryButton class="mr-auto" to="/reset-password">
          Update your password
        </PrimaryButton>
      </div>
      <div class="flex flex-col">
        <Heading level="h6" as="h3" class="mb-6">Email settings</Heading>
        <fieldset :disabled="emailsEnabled === false">
          <Well class="mb-4">
            <p>
              We will always email when you join or are seated in a game. You
              can control when some other emails are sent below.
            </p>
          </Well>
          <p class="mb-2 text-sm font-semibold">Email me when...</p>
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
        <PrimaryButton
          v-if="store.user"
          class="mt-4 mr-auto"
          @click="setUserSettings"
        >
          Update user preferences
        </PrimaryButton>
      </div>
      <div class="flex flex-col">
        <Heading level="h6" as="h3" class="mb-6">Web calendar</Heading>
        <Well>
          <p>
            Create a web calendar link that you can use with other programs to
            subscribe to your RSVPs and managed games. This link is unique to
            you and should be kept private.
          </p>
        </Well>
        <div v-if="store.userWebCalId" class="mt-3">
          <p class="text-sm font-semibold">
            {{ webcalLink }}
          </p>
          <div class="grid grid-cols-2 gap-3 mt-3">
            <SecondaryButton
              v-if="isSupported"
              size="small"
              :color="copied ? 'blue' : 'grey'"
              class="duration-150 transition-colors"
              @click="copy(webcalLink)"
            >
              <transition
                mode="out-in"
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-70 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-out"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0 "
              >
                <span v-if="copied"> Copied! </span>
                <span v-else> Copy webcal link </span>
              </transition>
            </SecondaryButton>

            <WarningButton size="small" @click="deleteWebCal">
              Delete my link (you can create a new one after)
            </WarningButton>
          </div>
        </div>
        <PrimaryButton
          v-else
          class="mt-4 mr-auto"
          :is-loading="creatingCal"
          @click="createWebCal"
        >
          Create your web calendar
        </PrimaryButton>
      </div>
    </div>
  </ProfileTemplate>
</template>

<script setup lang="ts">
import { supabase } from "@/supabase";
import { computed, ref, watch } from "vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import ProfileTemplate from "@/layouts/ProfileTemplate.vue";
import {
  createWebCalForUser,
  deleteWebCalForUser,
  updateProfile,
} from "@/api/profiles";
import Heading from "@/components/Heading.vue";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import Well from "@/components/Well.vue";
import { useClipboard } from "@vueuse/core";
import WarningButton from "@/components/Buttons/WarningButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";

const { showSuccess, showError } = useToast();
const { copy, copied, isSupported } = useClipboard();

const starttime = ref(store.user?.user_settings?.starttime);
const endtime = ref(store.user?.user_settings?.endtime);

const emailsEnabled = ref(
  store.user?.email_preferences?.email_enabled ?? false
);
const unreadNotificationEmailsEnabled = ref(
  store.user?.email_preferences?.unread_notifications_enabled ?? false
);
const rsvpToMyGameEmailsEnabled = ref(
  store.user?.email_preferences?.rsvp_to_my_game_enabled ?? false
);
const communityAdminEmailsEnabled = ref(
  store.user?.email_preferences?.send_community_admin_messages ?? false
);
const saving = ref(false);
const creatingCal = ref(false);
const webcalLink = computed(
  () =>
    `webcal://app.playabl.io/.netlify/functions/webcal?id=${store.userWebCalId}`
);

watch(
  () => emailsEnabled.value,
  (newVal) => {
    if (newVal === false) {
      unreadNotificationEmailsEnabled.value = false;
      rsvpToMyGameEmailsEnabled.value = false;
      communityAdminEmailsEnabled.value = false;
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

async function createWebCal() {
  if (!store.user?.id) {
    return;
  }
  creatingCal.value = true;
  try {
    const data = await createWebCalForUser(store.user.id);
    store.userWebCalId = data.webcal_id;
    showSuccess({ message: "Web calendar created" });
  } catch (error) {
    showError({ message: "Unable to create web calendar" });
  } finally {
    creatingCal.value = false;
  }
}

async function deleteWebCal() {
  if (!store.userWebCalId) {
    throw new Error("No webcal ID found. Please report this error.");
  }

  if (
    confirm(
      "Are you sure you want to delete your calendar link? You can create a new one after but will have to update any places where you have used the old value."
    )
  ) {
    try {
      await deleteWebCalForUser(store.userWebCalId);
      store.userWebCalId = null;
      showSuccess({
        message:
          "Web calendar deleted. You can now create a new one if you like.",
      });
    } catch (error) {
      showError({ message: "Unable to delete web calendar" });
    }
  }
}
</script>
