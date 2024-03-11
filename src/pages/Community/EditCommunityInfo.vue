<template>
  <form @submit.prevent="handleSubmit">
    <Heading level="h6" as="h2" class="mb-2"> Community Info </Heading>
    <div class="grid gap-6">
      <div class="flex flex-col">
        <FormLabel for="description">Description</FormLabel>
        <FormTextArea id="description" v-model="description" class="h-40" />
      </div>
      <div class="flex flex-col">
        <FormLabel for="howToJoin">How to join</FormLabel>
        <FormTextArea id="howToJoin" v-model="howToJoin" class="h-40" />
      </div>
      <div class="flex flex-col">
        <FormLabel for="website">Website</FormLabel>
        <FormInput id="website" v-model="website" type="url" />
      </div>
      <div class="flex flex-col">
        <FormLabel for="codeOfConductUrl">
          Community code of conduct
        </FormLabel>
        <FormInput
          id="codeOfConductUrl"
          v-model="codeOfConductUrl"
          type="url"
        />
        <p class="text-xs text-slate-700 mt-1">
          Don't have one? Consider adopting or creating one based off of
          <a
            href="https://openhearthgaming.com/code-of-conduct"
            target="_blank"
            rel="noreferrer noopener"
            class="text-brand-500 font-semibold hover:underline"
          >
            Open Hearth Gaming
          </a>
          or the
          <a
            href="https://www.contributor-covenant.org/"
            target="_blank"
            rel="noreferrer noopener"
            class="text-brand-500 font-semibold hover:underline"
          >
            Contributor Covenant
          </a>
        </p>
      </div>
      <div>
        <FormLabel>Game types</FormLabel>
        <p class="text-sm mt-1">
          Select one or more game types that your community plays.
        </p>
        <a
          href="https://github.com/Playabl-io/playabl/blob/main/src/util/gameSystemList.ts"
          class="text-xs mt-1 mb-3 mr-auto text-blue-700 flex gap-1"
          target="_blank"
        >
          Edit this list on GitHub
          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
        </a>
        <fieldset class="flex flex-wrap gap-4">
          <label
            v-for="tag in GAME_TAGS"
            :key="tag"
            :for="tag"
            class="rounded-xl border border-solid cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-offset-2 select-none"
            :class="[
              gameTypes.includes(tag)
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-500',
            ]"
          >
            <input
              :id="tag"
              v-model="gameTypes"
              name="gameType"
              type="checkbox"
              class="w-0 h-0 opacity-0"
              :value="tag"
            />
            <span class="p-2">
              {{ tag }}
            </span>
          </label>
        </fieldset>
        <p v-if="gametypesError" class="text-red-500 mt-2">
          {{ gametypesError }}
        </p>
      </div>
      <hr />
      <div>
        <FormLabel>Socials</FormLabel>
        <p class="text-sm mt-1 mb-3">
          Add your social links. A future update will allow you to add any
          socials and links you want to share. Stay tuned!
        </p>
        <fieldset class="flex flex-wrap gap-4 mt-4">
          <label
            v-for="social in SOCIALS"
            :key="social"
            :for="social"
            class="rounded-xl border border-solid cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-offset-2 select-none"
            :class="[
              enabledSocials.includes(social)
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-500',
            ]"
          >
            <input
              :id="social"
              v-model="enabledSocials"
              name="gameType"
              type="checkbox"
              class="w-0 h-0 opacity-0"
              :value="social"
            />
            <span class="p-2">
              {{ social }}
            </span>
          </label>
        </fieldset>
      </div>
      <div v-if="enabledSocials.includes('Twitter')" class="flex flex-col">
        <FormLabel for="twitter"> Twitter handle </FormLabel>
        <div class="relative flex items-center">
          <AtSymbolIcon class="h-5 w-5 absolute left-2 mt-2" />
          <FormInput id="twitter" v-model="twitter" class="pl-8 grow" />
        </div>
      </div>
      <div v-if="enabledSocials.includes('Facebook')" class="flex flex-col">
        <FormLabel for="facebook">Facebook</FormLabel>
        <FormInput id="facebook" v-model="facebook" type="url" />
        <p class="text-xs text-slate-700 mt-1">
          Enter full address. Ex: https://www.facebook.com/YourCommunity
        </p>
      </div>
      <div v-if="enabledSocials.includes('Discord')" class="flex flex-col">
        <FormLabel for="discord"> Discord </FormLabel>
        <FormInput id="discord" v-model="discord" type="url" />
        <p class="text-xs text-slate-700 mt-1">
          Enter full address. Ex: https://YourCommunity.discord.com
        </p>
      </div>
      <div v-if="enabledSocials.includes('Slack')" class="flex flex-col">
        <FormLabel for="slack">Slack</FormLabel>
        <FormInput id="slack" v-model="slack" type="url" />
        <p class="text-xs text-slate-700 mt-1">
          Enter full address. Ex: https://YourCommunity.slack.com
        </p>
      </div>
      <div v-if="enabledSocials.includes('Patreon')" class="flex flex-col">
        <FormLabel for="patreon">Patreon</FormLabel>
        <FormInput id="patreon" v-model="patreon" type="url" />
        <p class="text-xs text-slate-700 mt-1">
          Enter full address. Ex: https://patreon.com/YourCommunity
        </p>
      </div>
    </div>
    <PrimaryButton
      :is-loading="isSaving"
      class="mt-6 w-full"
      :disabled="Boolean(gametypesError)"
      >Update info</PrimaryButton
    >
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { AtSymbolIcon } from "@heroicons/vue/24/outline";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import { communityStore } from "./communityStore";
import useToast from "@/components/Toast/useToast";
import { updateCommunity } from "@/api/communities";
import { GAME_TAGS } from "@/util/gameSystemList";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";
import Heading from "@/components/Heading.vue";

const { showError, showSuccess } = useToast();

const SOCIALS = ["Twitter", "Facebook", "Discord", "Slack", "Patreon"];

const enabledSocials = ref<string[]>(
  SOCIALS.reduce((acc, social) => {
    // @ts-expect-error element has implicit any
    if (communityStore.community[social.toLowerCase()]) {
      acc.push(social);
    }
    return acc;
  }, [] as string[])
);
const description = ref(communityStore.community.description ?? "");
const howToJoin = ref(communityStore.community.how_to_join ?? "");
const website = ref(communityStore.community.website ?? "");
const codeOfConductUrl = ref(
  communityStore.community.code_of_conduct_url ?? ""
);
const twitter = ref(communityStore.community.twitter ?? "");
const facebook = ref(communityStore.community.facebook ?? "");
const discord = ref(communityStore.community.discord ?? "");
const slack = ref(communityStore.community.slack ?? "");
const patreon = ref(communityStore.community.patreon ?? "");
const gameTypes = ref<string[]>(communityStore.community.game_types ?? []);

const gametypesError = computed(() => {
  if (gameTypes.value.length === 0) {
    return "You must select at least one game type";
  }
  return "";
});

const isSaving = ref(false);

async function handleSubmit() {
  isSaving.value = true;
  try {
    const update = {
      description: description.value,
      how_to_join: howToJoin.value,
      website: website.value,
      code_of_conduct_url: codeOfConductUrl.value,
      twitter: enabledSocials.value.includes("Twitter") ? twitter.value : null,
      facebook: enabledSocials.value.includes("Facebook")
        ? facebook.value
        : null,
      discord: enabledSocials.value.includes("Discord") ? discord.value : null,
      slack: enabledSocials.value.includes("Slack") ? slack.value : null,
      patreon: enabledSocials.value.includes("Patreon") ? patreon.value : null,
      game_types: gameTypes.value,
    };
    await updateCommunity({
      communityId: communityStore.community.id,
      update,
    });
    showSuccess({ message: "Community info updated" });
    communityStore.community = { ...communityStore.community, ...update };
  } catch (error) {
    showError({ message: "Unable to update community info" });
  } finally {
    isSaving.value = false;
  }
}
</script>
