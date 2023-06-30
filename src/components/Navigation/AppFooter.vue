<template>
  <footer class="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-gray-100 z-10">
    <div class="col-span-2 flex flex-col justify-between">
      <img src="/playabl_192.png" alt="Playabl logo" class="w-12 h-12 filter" />
      <p class="text-xs text-slate-600 mt-2">© Playabl 2022 - 2023</p>
    </div>
    <div class="flex flex-col gap-2">
      <p class="font-semibold">Support</p>
      <a
        target="_blank"
        href="https://docs.playabl.io"
        class="text-sm hover:underline"
      >
        Documentation
      </a>
      <a
        target="_blank"
        class="text-sm hover:underline"
        href="https://github.com/Playabl-io/playabl"
      >
        View on GitHub
      </a>
      <a
        target="_blank"
        class="text-sm hover:underline"
        href="https://github.com/Playabl-io/playabl/issues"
      >
        File an issue, bug, or feature request
      </a>
    </div>
    <div class="flex flex-col gap-2">
      <p class="font-semibold">Legal</p>
      <RouterLink to="/privacy" class="text-sm hover:underline">
        Privacy Policy
      </RouterLink>
      <RouterLink to="/tos" class="text-sm hover:underline">
        Terms of Service
      </RouterLink>
    </div>
  </footer>
</template>
