<template>
  <div class="grid side-nav-responsive-grid gap-8 items-start">
    <nav class="flex flex-col gap-4 md:sticky md:top-[7.5rem]">
      <slot name="nav"></slot>
    </nav>
    <div>
      <slot name="content"></slot>
    </div>
  </div>
</template>
<style scoped>
.side-nav-responsive-grid {
  grid-template-columns: 1fr;
  grid-template-rows: auto;
}
@media screen(md) {
  .side-nav-responsive-grid {
    grid-template-columns: 10rem minmax(0, 1fr);
  }
}
</style>
