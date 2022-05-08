<template>
  <div class="grid side-nav-responsive-grid gap-8 items-start h-full">
    <nav class="flex flex-col gap-4 sm:sticky sm:top-[7.5rem]">
      <slot name="nav"></slot>
    </nav>
    <slot name="content"></slot>
  </div>
</template>
<style scoped>
.side-nav-responsive-grid {
  grid-template-columns: 1fr;
  grid-template-rows: auto;
}
@media screen(lg) {
  .side-nav-responsive-grid {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
}
@media screen(sm) {
  .side-nav-responsive-grid {
    grid-template-columns: auto minmax(0, 1fr);
  }
}
</style>
