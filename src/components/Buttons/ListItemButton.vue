<template>
  <button
    class="p-4 rounded-md transition-all transform duration-150 hover:shadow-lg hover:-translate-y-1"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>
<script setup lang="ts"></script>
