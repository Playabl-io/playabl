<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform opacity-0"
    enter-to-class="transform opacity-100"
    leave-active-class="transition ease-out duration-700"
    leave-from-class="transform opacity-100"
    leave-to-class="transform opacity-0"
  >
    <header
      v-if="!navHidden"
      class="w-screen fixed top-0 py-2 px-12 grid grid-cols-6 items-center box-border z-10"
      :class="{
        'shadow-md border-b border-solid border-gray-50 backdrop-blur-md bg-neutral-50 bg-opacity-75':
          !arrivedState.top,
      }"
      v-bind="$attrs"
    >
      <router-link to="/" class="font-paytone text-lg"> Playabl </router-link>
      <PopoverGroup as="nav" class="mx-auto col-span-4 flex items-center gap-3">
        <NavMenu>
          <template #title> Communities </template>
          <template #items>
            <NavMenuItem v-if="store.user" to="/communities/joined">
              Joined
            </NavMenuItem>
            <NavMenuItem
              to="/communities/browse?sort.key=member-count&sort.dir=desc"
            >
              Browse
            </NavMenuItem>
            <NavMenuItem v-if="store.user" to="/communities/manage">
              Manage
            </NavMenuItem>
            <NavMenuItem to="/communities/new"> Create New </NavMenuItem>
          </template>
        </NavMenu>
        <NavMenu>
          <template #title> Games </template>
          <template #items>
            <NavMenuItem v-if="store.user" to="/games/joined">
              Joined
            </NavMenuItem>
            <NavMenuItem to="/games/browse?sort.key=start_time&sort.dir=asc">
              Browse
            </NavMenuItem>
            <NavMenuItem v-if="store.user" to="/games/manage">
              Manage
            </NavMenuItem>
            <NavMenuItem to="/games/new"> Create New </NavMenuItem>
          </template>
        </NavMenu>
        <NavMenu>
          <template #title> Events </template>
          <template #items>
            <NavMenuItem to="/events/browse"> Browse </NavMenuItem>
            <NavMenuItem to="/events/new"> Create New </NavMenuItem>
          </template>
        </NavMenu>
      </PopoverGroup>
      <div class="flex justify-end">
        <user-menu />
      </div>
    </header>
  </Transition>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import UserMenu from "../UserMenu.vue";
import { store } from "../../store";
import { PopoverGroup } from "@headlessui/vue";
import NavMenu from "../Menus/NavMenu.vue";
import NavMenuItem from "../Menus/NavMenuItem.vue";
import { useScroll } from "@vueuse/core";

const navHidden = ref(false);
const scrollPoint = ref();
const { isScrolling, directions, arrivedState, y } = useScroll(window);

watch([isScrolling, directions], () => {
  if (isScrolling.value && directions.bottom && !scrollPoint.value) {
    scrollPoint.value = y.value;
  }
  if (isScrolling.value && directions.top) {
    navHidden.value = false;
    scrollPoint.value = undefined;
  }
});

watch([scrollPoint, y], () => {
  if (y.value - scrollPoint.value > 75) {
    navHidden.value = true;
  }
});
</script>
