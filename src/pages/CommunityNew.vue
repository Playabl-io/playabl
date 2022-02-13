<template>
  <BaseTemplate>
    <div class="max-w-2xl mx-auto grid grid-cols-3 gap-6 mb-8">
      <div class="h-1 rounded-xl bg-blue-500" />
      <div
        class="h-1 rounded-xl"
        :class="[state.value === 'screen1' ? 'bg-gray-300' : 'bg-blue-500']"
      />
      <div
        class="h-1 rounded-xl"
        :class="[state.value === 'screen3' ? 'bg-blue-500' : 'bg-gray-300']"
      />
    </div>
    <div v-if="state.value === 'screen1'">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="send('ADVANCE')"
      >
        <p class="text-lg mb-12">Tell us about your community</p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col">
            <FormLabel for="name" required> Community Name </FormLabel>
            <FormInput id="name" v-model="name" required />
            <p class="prose dark:prose-invert text-xs leading-6">
              Your community name must be unique and cannot be changed
            </p>
          </div>
          <div class="flex flex-col">
            <FormLabel for="description">Description</FormLabel>
            <FormTextArea id="description" v-model="description" class="h-40" />
          </div>
          <div class="flex flex-col">
            <FormLabel>Cover image</FormLabel>
            <label
              for="description"
              class="h-40 w-full p-3 rounded-lg bg-gray-200 bg-opacity-70 mt-2"
              @dragenter.prevent
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <span
                class="w-full h-full p-3 grid place-items-center border border-dashed border-gray-400 rounded-md"
              >
                <template v-if="coverImage">
                  {{ coverImage.name }}
                  <GhostButton type="button" @click="coverImage = undefined">
                    Clear
                  </GhostButton>
                </template>
                <template v-else>
                  <PrimaryButton type="button" @click="fileInput?.click()">
                    Choose a file
                  </PrimaryButton>
                  <p>or drop your file here</p>
                  <p class="text-sm text-slate-700">3 MB max file size</p>
                </template>
              </span>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
        </div>
        <OutlineButton class="mt-8 font-semibold">
          Next <ArrowSmRightIcon class="h-6 w-6" />
        </OutlineButton>
      </form>
    </div>
    <div v-if="state.value === 'screen2'">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="validateAtLeastOneGameTypeChosen"
      >
        <p class="text-lg mb-1">Let's add some details</p>
        <p class="text-xs mb-12 text-slate-700">
          You can always update these later
        </p>
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col">
            <FormLabel>
              What kinds of games does your community organize and play?
            </FormLabel>
            <p class="text-xs mt-1 text-slate-700">
              These will help others find and gauge interest in your community
            </p>
            <p
              v-if="gameTypesError"
              class="text-sm text-red-500 font-semibold mt-4"
            >
              {{ gameTypesError }}
            </p>
            <fieldset class="flex flex-wrap gap-4 mt-6">
              <label
                v-for="tag in GAME_TAGS"
                :key="tag"
                :for="tag"
                class="rounded-xl border border-solid border-gray-300 cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-offset-2 select-none"
                :class="{
                  'border-blue-500 bg-blue-500 text-white':
                    gameTypes.includes(tag),
                }"
              >
                <input
                  :id="tag"
                  v-model="gameTypes"
                  name="gameType"
                  type="checkbox"
                  class="w-0 h-0 opacity-0"
                  :value="tag"
                  @change="gameTypesError = ''"
                />
                <span class="p-2">
                  {{ tag }}
                </span>
              </label>
            </fieldset>
          </div>
          <hr />
          <div>
            <div class="p-4 rounded-lg bg-gray-100 flex items-center space-x-2">
              <FormCheckbox id="allow-public" v-model="allowPublicSignup" />
              <FormLabel class="font-normal" for="allow-public">
                Allow others to join without invite?
              </FormLabel>
            </div>
          </div>
          <div v-if="!allowPublicSignup" class="flex flex-col">
            <FormLabel for="name">
              How can people join your community?
            </FormLabel>
            <FormTextArea id="howToJoin" v-model="howToJoin" class="h-40" />
            <p class="text-xs text-slate-700 mt-1">
              Optional. Give people short direction on how they can join.
            </p>
          </div>
          <div v-else>
            <p>
              You have opted to allow any user to become a member of your
              community. This can be changed later.
            </p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 max-w-2xl">
          <OutlineButton
            type="button"
            class="mt-8 font-semibold"
            @click="send('BACK')"
          >
            <ArrowSmLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton class="mt-8">
            Next <ArrowSmRightIcon class="h-6 w-6" />
          </PrimaryButton>
        </div>
      </form>
    </div>
    <div v-if="['screen3', 'submitting'].includes(state.value as string)">
      <form
        class="max-w-2xl mx-auto flex flex-col"
        @submit.prevent="createCommunity"
      >
        <p class="text-lg mb-12">Any links to share?</p>
        <div class="grid grid-cols-1 gap-8">
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
              Code of conducts aren't required, but highly encouraged!
              <br />
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
          <p class="text-lg">Select any social links to add</p>
          <div class="flex space-x-4">
            <SwitchGroup>
              <div class="flex items-center">
                <SwitchLabel class="mr-2 text-sm">Twitter</SwitchLabel>
                <Switch
                  v-model="twitterEnabled"
                  :class="
                    twitterEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-300 bg-opacity-70'
                  "
                  class="relative inline-flex flex-shrink-0 h-[24px] w-[48px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-opacity-75"
                >
                  <span
                    aria-hidden="true"
                    :class="twitterEnabled ? 'translate-x-6' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
                  />
                </Switch>
              </div>
            </SwitchGroup>
            <SwitchGroup>
              <div class="flex items-center">
                <SwitchLabel class="mr-2 text-sm">Facebook</SwitchLabel>
                <Switch
                  v-model="facebookEnabled"
                  :class="
                    facebookEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-300 bg-opacity-70'
                  "
                  class="relative inline-flex flex-shrink-0 h-[24px] w-[48px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-opacity-75"
                >
                  <span
                    aria-hidden="true"
                    :class="facebookEnabled ? 'translate-x-6' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
                  />
                </Switch>
              </div>
            </SwitchGroup>
            <SwitchGroup>
              <div class="flex items-center">
                <SwitchLabel class="mr-2 text-sm">Discord</SwitchLabel>
                <Switch
                  v-model="discordEnabled"
                  :class="
                    discordEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-300 bg-opacity-70'
                  "
                  class="relative inline-flex flex-shrink-0 h-[24px] w-[48px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-opacity-75"
                >
                  <span
                    aria-hidden="true"
                    :class="discordEnabled ? 'translate-x-6' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
                  />
                </Switch>
              </div>
            </SwitchGroup>
            <SwitchGroup>
              <div class="flex items-center">
                <SwitchLabel class="mr-2 text-sm">Slack</SwitchLabel>
                <Switch
                  v-model="slackEnabled"
                  :class="
                    slackEnabled ? 'bg-green-500' : 'bg-gray-300 bg-opacity-70'
                  "
                  class="relative inline-flex flex-shrink-0 h-[24px] w-[48px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-opacity-75"
                >
                  <span
                    aria-hidden="true"
                    :class="slackEnabled ? 'translate-x-6' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
                  />
                </Switch>
              </div>
            </SwitchGroup>
          </div>
          <div v-if="twitterEnabled" class="flex flex-col">
            <FormLabel for="twitter"> Twitter handle </FormLabel>
            <div class="relative flex items-center">
              <AtSymbolIcon class="h-5 w-5 absolute left-2 mt-2" />
              <FormInput id="twitter" v-model="twitter" class="pl-8 grow" />
            </div>
          </div>
          <div v-if="facebookEnabled" class="flex flex-col">
            <FormLabel for="facebook">Facebook</FormLabel>
            <FormInput id="facebook" v-model="facebook" type="url" />
            <p class="text-xs text-slate-700 mt-1">
              Enter full address. Ex: https://www.facebook.com/YourCommunity
            </p>
          </div>
          <div v-if="discordEnabled" class="flex flex-col">
            <FormLabel for="discord"> Discord </FormLabel>
            <FormInput id="discord" v-model="discord" type="url" />
            <p class="text-xs text-slate-700 mt-1">
              Enter full address. Ex: https://YourCommunity.discord.com
            </p>
          </div>
          <div v-if="slackEnabled" class="flex flex-col">
            <FormLabel for="slack">Slack</FormLabel>
            <FormInput id="slack" v-model="slack" type="url" />
            <p class="text-xs text-slate-700 mt-1">
              Enter full address. Ex: https://YourCommunity.slack.com
            </p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 max-w-2xl">
          <OutlineButton
            type="button"
            class="mt-8 font-semibold"
            @click="send('BACK')"
          >
            <ArrowSmLeftIcon class="h-6 w-6" /> Back
          </OutlineButton>
          <PrimaryButton
            class="mt-8"
            :is-loading="state.value === 'submitting'"
          >
            Create
          </PrimaryButton>
        </div>
      </form>
    </div>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMachine } from "@xstate/vue";
import { createMachine } from "xstate";
import { SwitchGroup, SwitchLabel, Switch } from "@headlessui/vue";
import BaseTemplate from "@/components/BaseTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import { AtSymbolIcon } from "@heroicons/vue/outline";
import { ArrowSmRightIcon, ArrowSmLeftIcon } from "@heroicons/vue/solid";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import {
  AccessLevel,
  ACCESS_LEVEL_TIME_DENOMINATION,
} from "@/typings/AccessLevel";
import useToast from "@/components/Toast/useToast";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import { uploadToCoverImageStorage } from "@/api/storage";

const { showError } = useToast();

const GAME_TAGS = [
  "Call of Cthulhu",
  "Crunchy",
  "D&D",
  "Fantasy",
  "Fate",
  "Indie",
  "LARP",
  "gmless",
  "Narrative",
  "OSR",
  "PBTA",
  "Rules light",
  "Sci-fi",
  "Star Trek",
  "Star Wars",
  "Story games",
];

const router = useRouter();

const newCommunityMachine = createMachine({
  id: "newCommunity",
  initial: "screen1",
  states: {
    screen1: {
      on: { ADVANCE: "screen2" },
    },
    screen2: {
      on: { BACK: "screen1", ADVANCE: "screen3" },
    },
    screen3: {
      on: { BACK: "screen2", SUBMIT: "submitting", NO_USER: "show_signup" },
    },
    submitting: {
      on: {
        ERROR: "screen3",
      },
    },
    show_signup: {
      type: "final",
    },
  },
});
const { state, send } = useMachine(newCommunityMachine);

const name = ref("");
const description = ref("");
const howToJoin = ref("");
const gameTypes = ref<string[]>([]);
const gameTypesError = ref("");
const allowPublicSignup = ref(false);
const coverImage = ref<File>();
const website = ref("");
const codeOfConductUrl = ref("");
const twitterEnabled = ref(false);
const facebookEnabled = ref(false);
const discordEnabled = ref(false);
const slackEnabled = ref(false);
const twitter = ref("");
const facebook = ref("");
const discord = ref("");
const slack = ref("");

const fileInput = ref<HTMLButtonElement>();

function handleFileDrop(event: DragEvent) {
  const dt = event.dataTransfer;
  const file = dt?.files[0];
  if (!file?.type.startsWith("image/")) {
    showError({ message: "Only image files are allowed" });
    return;
  }
  if (file.size > 3000000) {
    showError({
      message: "That file is too large. Only files under 3 MB are allowed",
    });
    return;
  }
  coverImage.value = file;
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 3000000) {
    showError({
      message: "That file is too large. Only files under 3 MB are allowed",
    });
  }
  coverImage.value = file;
}

function validateAtLeastOneGameTypeChosen() {
  if (gameTypes.value.length === 0) {
    gameTypesError.value =
      "Please select at least one game type to help others know what kinds of games your community is interested in.";
  } else {
    send("ADVANCE");
  }
}

async function createCommunity() {
  if (!store.user) {
    send("NO_USER");
    return;
  }
  send("SUBMIT");
  try {
    let imagePath;
    if (coverImage.value) {
      imagePath = await uploadToCoverImageStorage(coverImage.value);
    }
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: name.value,
        description: description.value,
        how_to_join: howToJoin.value,
        game_types: gameTypes.value,
        website: website.value,
        twitter: twitter.value,
        facebook: facebook.value,
        discord: discord.value,
        slack: slack.value,
        owner_id: store.user.id,
        allow_public_signup: allowPublicSignup.value,
        cover_image: imagePath,
        code_of_conduct_url: codeOfConductUrl.value,
      })
      .single();
    if (error) throw error;

    router.push(`/communities/${data.id}/manage`);
  } catch (error) {
    log({ error });
    showError({ message: "Somethin went wrong" });
    send("ERROR");
  }
}
</script>
