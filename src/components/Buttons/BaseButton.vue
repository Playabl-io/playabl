<template>
  <button
    class="flex justify-center items-center font-semibold p-2 rounded-md h-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-sky-500"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>
