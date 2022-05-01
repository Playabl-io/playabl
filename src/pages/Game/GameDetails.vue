<template>
  <div v-if="state.value === 'loading'" class="grid place-content-center">
    <LoadingSpinner color="brand-500" />
  </div>
  <div v-else-if="state.value === 'preview'" class="grid grid-cols-2 gap-8">
    <div v-if="state.context.blocks.length === 0" class="col-span-full">
      The game creator has not set any details yet or you do not have access
    </div>
    <div
      v-for="block in state.context.blocks"
      :key="block.id"
      class="p-4 border border-solid rounded-md relative border-gray-300"
      :class="block.width"
    >
      <p class="text-lg font-semibold mb-8 font-paytone">{{ block.title }}</p>
      <div class="-m-4">
        <ResponsiveQuill :content="block.content" />
      </div>
    </div>
  </div>
  <div
    v-else-if="['settingUp', 'editing', 'saving'].includes(state.value as string)"
  >
    <div class="flex justify-between">
      <p class="text-sm">
        Create a custom page with game details to share with your players by
        adding blocks with info and links.
      </p>
      <SecondaryButton
        :is-loading="state.value === 'saving'"
        @click="send('SAVE_BLOCKS')"
      >
        <CloudUploadIcon class="w-5 h-5 mr-2" />
        Save details page
      </SecondaryButton>
    </div>
    <div class="grid edit-grid items-start gap-6 mt-12">
      <div class="grid grid-cols-2 gap-8">
        <div
          v-for="(block, index) in state.context.blocks"
          :key="block.id"
          class="p-4 border-solid rounded-md relative"
          :class="[
            index === state.context.activeIndex
              ? 'border-2 border-brand-300 shadow-lg'
              : 'border border-gray-300',
            block.width,
          ]"
        >
          <div class="absolute top-2 right-2 flex">
            <GhostButton
              size="small"
              :disabled="index === 0"
              @click="
                send({
                  type: 'MOVE_BLOCK',
                  payload: { currentIndex: index, nextIndex: index - 1 },
                })
              "
            >
              <ArrowSmLeftIcon class="w-5 h-5" />
            </GhostButton>
            <GhostButton
              size="small"
              :disabled="index === state.context.blocks.length - 1"
              @click="
                send({
                  type: 'MOVE_BLOCK',
                  payload: { currentIndex: index, nextIndex: index + 1 },
                })
              "
            >
              <ArrowSmRightIcon class="w-5 h-5" />
            </GhostButton>
            <GhostButton
              size="small"
              @click="send({ type: 'SET_ACTIVE_BLOCK', payload: { index } })"
            >
              <PencilAltIcon class="w-5 h-5" />
            </GhostButton>
            <GhostButton
              size="small"
              @click="send({ type: 'REMOVE_BLOCK', payload: { index } })"
            >
              <TrashIcon class="w-5 h-5" />
            </GhostButton>
          </div>
          <p class="text-lg font-semibold mb-8 font-paytone">
            {{ block.title }}
          </p>
          <div class="-m-4">
            <ResponsiveQuill :content="block.content" />
          </div>
        </div>
        <PrimaryButton class="col-span-full" @click="send('ADD_BLOCK')">
          <DocumentAddIcon class="w-5 h-5 mr-2" />
          Add block
        </PrimaryButton>
      </div>
      <div class="rounded-md bg-gray-200 py-8 px-6">
        <div class="flex flex-col">
          <FormLabel>Block title</FormLabel>
          <FormInput
            :value="activeBlock?.title"
            required
            @input="
              send({
                type: 'UPDATE_BLOCK',
                payload: { title: $event.target?.value },
              })
            "
          />
        </div>
        <div class="flex flex-col mt-6">
          <FormLabel>Block width</FormLabel>
          <div class="grid grid-cols-2 gap-8">
            <label
              class="flex items-center gap-4 rounded-md p-2 border border-solid"
              :class="[
                activeBlock?.width === 'col-span-full'
                  ? 'border-blue-500'
                  : 'border-slate-400',
              ]"
            >
              <input
                required
                type="radio"
                value="col-span-full"
                name="width"
                class="text-blue-500"
                :checked="activeBlock?.width === 'col-span-full'"
                @change="
                  send({
                    type: 'UPDATE_BLOCK',
                    payload: { width: $event.target?.value },
                  })
                "
              />
              Full
            </label>
            <label
              class="flex items-center gap-4 rounded-md p-2 border border-solid"
              :class="[
                activeBlock?.width === 'w-full'
                  ? 'border-blue-500'
                  : 'border-slate-400',
              ]"
            >
              <input
                required
                type="radio"
                value="w-full"
                name="width"
                class="text-blue-500"
                :checked="activeBlock?.width === 'w-full'"
                @change="
                  send({
                    type: 'UPDATE_BLOCK',
                    payload: { width: $event.target?.value },
                  })
                "
              />
              Half
            </label>
          </div>
        </div>
        <div class="flex flex-col mt-6">
          <FormLabel :no-margin="true">Block content</FormLabel>
          <p class="text-xs mb-1">Supports rich formatting</p>
          <div
            class="bg-white h-80 rounded-lg py-2 border border-solid border-gray-300 mt-2"
          >
            <QuillEditor
              ref="editor"
              theme="bubble"
              toolbar="essential"
              @update:content="
                send({
                  type: 'UPDATE_BLOCK',
                  payload: {
                    content: $event,
                  },
                })
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { Delta } from "@vueup/vue-quill";
import { useMachine } from "@xstate/vue";
import { createMachine, assign } from "xstate";
import {
  ArrowSmLeftIcon,
  ArrowSmRightIcon,
  TrashIcon,
  PencilAltIcon,
  CloudUploadIcon,
  DocumentAddIcon,
} from "@heroicons/vue/outline";
import { store } from "@/store";
import { gameStore } from "./gameStore";
import { GameDetailBlock } from "@/typings/Game";
import FormLabel from "@/components/Forms/FormLabel.vue";
import FormInput from "@/components/Forms/FormInput.vue";
import PrimaryButton from "@/components/Buttons/PrimaryButton.vue";
import GhostButton from "@/components/Buttons/GhostButton.vue";
import SecondaryButton from "@/components/Buttons/SecondaryButton.vue";
import ResponsiveQuill from "./ResponsiveQuill.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { loadGameDetails, saveGameDetails } from "@/api/gamesAndSessions";
import useToast from "@/components/Toast/useToast";
import { log } from "@/util/logger";

const { showSuccess, showError } = useToast();

const userIsCreator = computed(
  () => gameStore.game.creator_id === store.user?.id
);

const editor = ref();

const gameDetailsMachine = createMachine(
  {
    schema: {
      context: {} as {
        gameDetailsId?: number;
        activeIndex: number;
        blocks: GameDetailBlock[];
      },
      events: {} as
        | { type: "EDIT" }
        | { type: "PREVIEW" }
        | {
            type: "ADD_BLOCK";
          }
        | {
            type: "UPDATE_BLOCK";
            payload: { title?: string; width?: string; content?: Delta };
          }
        | {
            type: "SET_ACTIVE_BLOCK";
            payload: { index: number };
          }
        | {
            type: "MOVE_BLOCK";
            payload: { currentIndex: number; nextIndex: number };
          }
        | { type: "REMOVE_BLOCK"; payload: { index: number } }
        | { type: "SAVE_BLOCKS" },
    },
    id: "gameDetailsMachine",
    initial: "loading",
    context: {
      activeIndex: 0,
      blocks: [],
    },
    states: {
      loading: {
        invoke: {
          src: "loadGameDetails",
          onDone: [
            {
              target: "settingUp",
              cond: () => userIsCreator.value,
              actions: ["setBlocks", "setGameDetailsId"],
            },
            {
              target: "preview",
              actions: ["setBlocks"],
            },
          ],
          onError: {
            target: "preview",
            actions: ["showLoadError"],
          },
        },
      },
      preview: {},
      settingUp: {
        after: {
          300: "editing",
        },
      },
      editing: {
        entry: ["setContent"],
        on: {
          ADD_BLOCK: {
            actions: ["addBlock"],
          },
          UPDATE_BLOCK: {
            actions: ["updateBlock"],
          },
          SET_ACTIVE_BLOCK: {
            actions: ["setActiveBlock"],
          },
          MOVE_BLOCK: {
            actions: ["swapBlocks"],
          },
          REMOVE_BLOCK: {
            actions: ["removeBlock"],
          },
          SAVE_BLOCKS: "saving",
        },
      },
      saving: {
        invoke: {
          src: "saveGameDetails",
          onDone: {
            target: "editing",
            actions: ["showSaveSuccess", "setGameDetailsId"],
          },
          onError: {
            target: "editing",
            actions: ["showSaveError"],
          },
        },
      },
    },
  },
  {
    services: {
      async loadGameDetails() {
        return loadGameDetails(gameStore.game.id);
      },
      saveGameDetails(context) {
        return saveGameDetails({
          id: context.gameDetailsId,
          gameId: gameStore.game.id,
          detailBlocks: context.blocks,
        });
      },
    },
    actions: {
      setBlocks: assign((context, event) => {
        return {
          blocks: event.data?.detail_blocks ?? [],
          activeIndex: 0,
        };
      }),
      setGameDetailsId: assign((context, event) => {
        return {
          gameDetailsId: event.data?.id,
        };
      }),
      setContent: (context) => {
        const activeBlock = context.blocks[0];
        if (activeBlock?.content) {
          editor.value.setContents(activeBlock.content);
        }
      },
      addBlock: assign((context) => {
        const nextBlocks = context.blocks.concat({
          id: uuidv4(),
          title: "",
          content: {},
          width: "col-span-full",
        });
        editor.value.setContents({});
        return {
          blocks: nextBlocks,
          activeIndex: nextBlocks.length - 1,
        };
      }),
      updateBlock: assign((context, event) => {
        const block = context.blocks[context.activeIndex];
        const blocks = [...context.blocks];
        blocks.splice(context.activeIndex, 1, {
          width: "col-span-full",
          ...block,
          ...event.payload,
        });
        return {
          blocks,
        };
      }),
      setActiveBlock: assign((context, event) => {
        const activeBlock = context.blocks[event.payload.index];
        editor.value.setContents(activeBlock.content);
        return {
          activeIndex: event.payload.index,
        };
      }),
      swapBlocks: assign({
        blocks: (context, event) => {
          const blockA = context.blocks[event.payload.currentIndex];
          const blockB = context.blocks[event.payload.nextIndex];
          const nextBlocks = [...context.blocks];
          nextBlocks.splice(event.payload.currentIndex, 1, blockB);
          nextBlocks.splice(event.payload.nextIndex, 1, blockA);
          return nextBlocks;
        },
      }),
      removeBlock: assign((context, event) => {
        const nextBlocks = [...context.blocks];
        nextBlocks.splice(event.payload.index, 1);
        const nextActiveIndex = Math.min(
          Math.max(nextBlocks.length - 1, 0),
          event.payload.index
        );
        const activeBlock = nextBlocks[nextActiveIndex];
        editor.value.setContents(activeBlock?.content ?? {});
        return {
          blocks: nextBlocks,
          activeIndex: nextActiveIndex,
        };
      }),
      showSaveSuccess: () => showSuccess({ message: "Game details updated" }),
      showSaveError: () =>
        showError({ message: "Unable to save game details" }),
      showLoadError: () =>
        showError({
          message:
            "Unable to load game details. Please try again or contact support.",
        }),
    },
  }
);

const { state, send } = useMachine(gameDetailsMachine);

const activeBlock = computed(
  () => state.value.context.blocks[state.value.context.activeIndex]
);
</script>
<style scoped>
.edit-grid {
  grid-template-columns: minmax(0, 1fr) minmax(380px, 25%);
}
</style>
