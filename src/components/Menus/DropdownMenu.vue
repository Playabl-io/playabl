<template>
  <section class="relative flex flex-col items-center">
    <Menu>
      <MenuButton v-slot="{ open }" class="hover:underline relative">
        <slot name="title" :open="open"></slot>
      </MenuButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-70 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-70 opacity-0"
      >
        <MenuItems
          class="absolute z-20 whitespace-nowrap top-full mt-2 p-2 flex flex-col items-start space-y-2 bg-white border border-grey-50 rounded-lg shadow-md text-slate-900"
        >
          <slot name="items"></slot>
        </MenuItems>
      </transition>
    </Menu>
  </section>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from "@headlessui/vue";
</script>
