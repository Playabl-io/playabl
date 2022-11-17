<template>
  <section
    class="h-full bg-gradient-to-b from-violet-500 to-violet-700 flex flex-col text-white"
  >
    <nav class="flex justify-end items-center gap-6 px-12 [height:72px] z-10">
      <router-link v-if="store.user?.id" to="/communities/browse">
        Communities
      </router-link>
      <router-link v-if="store.user?.id" to="/games/browse">
        Games
      </router-link>
      <UserMenu />
    </nav>
    <main class="grid justify-items-center h-screen absolute w-screen">
      <div class="max-w-2xl">
        <h1
          class="text-center font-paytone bg-gradient-to-b from-white to-gray-200 text-transparent text-6xl md:text-9xl drop-shadow-2xl bg-clip-text py-12 mt-32"
        >
          Playabl
        </h1>
        <div
          class="bg-gradient-to-br from-white to-gray-200 shadow-2xl rounded-lg p-6 mx-12 max-w-xl text-slate-700"
        >
          <p class="mb-4">
            Playabl is a new way of finding and managing roleplaying communities
            and games.
          </p>
          <p>
            We're currently in beta, but you can
            <a href="https://playabl.io" class="text-blue-700 underline">
              check out the interest page for more info and to subscribe for
              updates!
            </a>
          </p>
        </div>
      </div>
    </main>
  </section>
</template>
<script setup lang="ts">
import UserMenu from "@/components/UserMenu.vue";
import { store } from "@/store";
</script>
