<template>
  <component
    :is="table ? 'button' : 'div'"
    class="text-left grid border border-solid border-gray-300 rounded-lg p-4"
    :class="{
      'bg-blue-700 text-white': variant === 'filled',
    }"
    @click="showRecords = true"
  >
    <p class="mb-2 text-right">{{ title }}</p>
    <p class="text-2xl place-self-end font-semibold">
      {{ value }}
    </p>
    <BaseModal
      v-if="table"
      :title="title"
      :open="showRecords"
      @close="showRecords = false"
    >
      <DismissButton
        label="close"
        class="absolute top-4 right-4"
        @click="showRecords = false"
      />
      <slot name="body">
        <TanTable :table="table" />
      </slot>
      <div class="mt-4 flex justify-end space-x-4"></div>
    </BaseModal>
  </component>
</template>
<script setup lang="ts">
import { ref, PropType } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import TanTable from "./TanTable.vue";
import { Table } from "@tanstack/vue-table";
import DismissButton from "../Buttons/DismissButton.vue";

const showRecords = ref(false);

defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  table: {
    type: Object as PropType<Table<any>>,
    required: false,
    default: undefined,
  },
  variant: {
    type: String as PropType<"filled" | "outline">,
    default: "filled",
    validator(val: string) {
      return ["filled", "outline"].includes(val);
    },
  },
});
</script>
