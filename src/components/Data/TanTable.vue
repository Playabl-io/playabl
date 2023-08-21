<template>
  <table class="w-full">
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th
          v-for="header in headerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
          class="p-2"
          :class="
            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
          "
          @click="header.column.getToggleSortingHandler()?.($event)"
        >
          <div v-if="!header.isPlaceholder" class="flex items-center gap-1">
            <FlexRender
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
            <ChevronUpIcon
              v-if="header.column.getIsSorted() === 'asc'"
              class="w-5 h-5"
            />
            <ChevronDownIcon
              v-if="header.column.getIsSorted() === 'desc'"
              class="w-5 h-5"
            />
          </div>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="row in table.getRowModel().rows.slice(0, 10)"
        :key="row.id"
        class="odd:bg-gray-100"
      >
        <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="p-2">
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </td>
      </tr>
    </tbody>

    <tfoot>
      <tr v-for="footerGroup in table.getFooterGroups()" :key="footerGroup.id">
        <th
          v-for="header in footerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.footer"
            :props="header.getContext()"
          />
        </th>
      </tr>
    </tfoot>
  </table>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { FlexRender, Table } from "@tanstack/vue-table";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline";

defineProps({
  table: {
    type: Object as PropType<Table<unknown>>,
    required: true,
  },
});
</script>
