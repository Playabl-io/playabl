<template>
  <button
    class="flex justify-center items-center font-semibold p-2 rounded-md h-10"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>
