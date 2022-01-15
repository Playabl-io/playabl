<script setup lang="ts"></script>
<template>
  <button v-bind="$attrs" class="p-2 rounded-md bg-slate-200 text-black">
    <slot></slot>
  </button>
</template>