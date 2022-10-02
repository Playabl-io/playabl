<template>
  <form class="flex flex-col h-full" @submit.prevent="handleSubmit">
    <Heading level="h6" as="h3" class="mt-10 mx-10 mb-4">
      Update community info
    </Heading>
    <section class="grow overflow-auto px-10 pb-8">
      <div class="grid gap-6">
        <div class="flex flex-col">
          <FormLabel for="description">Description</FormLabel>
          <FormTextArea id="description" v-model="description" class="h-40" />
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
              href="https://www.gauntlet-rpg.com/community-code-of-conduct.html"
              target="_blank"
              rel="noreferrer noopener"
              class="text-brand-500 font-semibold hover:underline"
            >
              The Gauntlet's
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
        <hr />
        <fieldset class="flex flex-wrap gap-4 mt-4">
          <label
            v-for="social in SOCIALS"
            :key="social"
            :for="social"
            class="rounded-xl border border-solid border-gray-300 cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-offset-2 select-none"
            :class="{
              'border-blue-500 bg-blue-500 text-white':
                enabledSocials.includes(social),
            }"
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
    </section>
    <DrawerFooter>
      <OutlineButton :disabled="isSaving" type="button" @click="emit('close')"
        >Cancel</OutlineButton
      >
      <PrimaryButton :is-loading="isSaving">Update info</PrimaryButton>
    </DrawerFooter>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { AtSymbolIcon } from "@heroicons/vue/24/outline";
import DrawerFooter from "@/components/DrawerFooter.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import Heading from "@/components/Heading.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import { communityStore } from "./communityStore";
import useToast from "@/components/Toast/useToast";
import { updateCommunity } from "@/api/communities";

const { showError, showSuccess } = useToast();

const emit = defineEmits(["close"]);

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
const website = ref(communityStore.community.website);
const codeOfConductUrl = ref(communityStore.community.code_of_conduct_url);
const twitter = ref(communityStore.community.twitter);
const facebook = ref(communityStore.community.facebook);
const discord = ref(communityStore.community.discord);
const slack = ref(communityStore.community.slack);
const patreon = ref(communityStore.community.patreon);

const isSaving = ref(false);

async function handleSubmit() {
  isSaving.value = true;
  try {
    const update = {
      description: description.value,
      website: website.value,
      code_of_conduct_url: codeOfConductUrl.value,
      twitter: enabledSocials.value.includes("Twitter") ? twitter.value : null,
      facebook: enabledSocials.value.includes("Facebook")
        ? facebook.value
        : null,
      discord: enabledSocials.value.includes("Discord") ? discord.value : null,
      slack: enabledSocials.value.includes("Slack") ? slack.value : null,
      patreon: enabledSocials.value.includes("Patreon") ? patreon.value : null,
    };
    await updateCommunity({
      communityId: communityStore.community.id,
      update,
      returning: "minimal",
    });
    showSuccess({ message: "Community info updated" });
    communityStore.community = { ...communityStore.community, ...update };
    emit("close");
  } catch (error) {
    showError({ message: "Unable to update community info" });
  } finally {
    isSaving.value = false;
  }
}
</script>
