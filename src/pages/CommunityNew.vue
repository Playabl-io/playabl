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
            <FormFileInput
              :file="existingImageToUse?.src || coverImage"
              size-limit="3 MB"
              @file-change="onFileChange"
              @file-drop="onFileDrop"
              @clear-file="clearFile"
            />
            <LinkButton
              class="text-sm mt-2"
              type="button"
              @click="showGallery = true"
            >
              Or select from your media
            </LinkButton>
            <ImageGalleryModal
              :open="showGallery"
              @close="showGallery = false"
              @select="handleImageSelect"
            />
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
              class="text-sm text-red-700 font-semibold mt-4"
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
              <FormLabel
                class="font-normal"
                for="allow-public"
                :no-margin="true"
              >
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
            </p>
            <p class="text-xs text-slate-700 mt-2">
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
          <div>
            <p class="text-lg">Select any social links to add</p>
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
import BaseTemplate from "@/components/BaseTemplate.vue";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import FormCheckbox from "@/components/Forms/FormCheckbox.vue";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import { AtSymbolIcon } from "@heroicons/vue/outline";
import { ArrowSmRightIcon, ArrowSmLeftIcon } from "@heroicons/vue/solid";
import OutlineButton from "@/components/Buttons/OutlineButton.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import LinkButton from "@/components/Buttons/LinkButton.vue";
import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import { store } from "@/store";
import useToast from "@/components/Toast/useToast";
import { uploadToCoverImageStorage } from "@/api/storage";
import FormFileInput from "@/components/Forms/FormFileInput.vue";
import {
  handleFileChange,
  handleFileDrop,
} from "@/components/Forms/fileInputUtil";
import ImageGalleryModal from "@/components/Modals/ImageGalleryModal.vue";
import { FileObject } from "@/typings/Storage";

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

const SOCIALS = ["Twitter", "Facebook", "Discord", "Slack", "Patreon"];

const enabledSocials = ref<string[]>([]);

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
const twitter = ref("");
const facebook = ref("");
const discord = ref("");
const slack = ref("");
const patreon = ref("");

const existingImageToUse = ref<{ image: FileObject; src: string }>();
const showGallery = ref(false);
function handleImageSelect(selection: { image: FileObject; src: string }) {
  existingImageToUse.value = selection;
  showGallery.value = false;
}

function onFileDrop(event: DragEvent) {
  const file = handleFileDrop(event, { value: 3000000, label: "3 MB" });
  if (file) {
    coverImage.value = file;
    existingImageToUse.value = undefined;
  }
}

function onFileChange(event: Event) {
  const file = handleFileChange(event, { value: 3000000, label: "3 MB" });
  if (file) {
    coverImage.value = file;
    existingImageToUse.value = undefined;
  }
}

function clearFile() {
  coverImage.value = undefined;
  existingImageToUse.value = undefined;
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
    if (existingImageToUse.value) {
      imagePath = `${store.user.id}/${existingImageToUse.value.image.name}`;
    } else if (coverImage.value) {
      imagePath = await uploadToCoverImageStorage({
        file: coverImage.value,
        id: store.user.id,
      });
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
        patreon: patreon.value,
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
    showError({ message: "Something went wrong" });
    send("ERROR");
  }
}
</script>
