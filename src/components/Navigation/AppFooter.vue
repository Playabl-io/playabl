<template>
  <footer class="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-gray-100">
    <div class="col-span-2 flex flex-col justify-between">
      <img
        key="footer-playabl-logo"
        src="/playabl_192.png"
        alt="Playabl logo"
        class="w-12 h-12 filter"
      />
      <p class="text-xs text-slate-600 mt-2">© Playabl 2022</p>
    </div>
    <div class="flex flex-col">
      <p class="font-semibold mb-4">Support</p>
      <a href="https://docs.playabl.io" class="text-sm hover:underline mb-2">
        Documentation
      </a>
      <a class="text-sm hover:underline" href="mailto:support@playabl.io">
        Contact
      </a>
    </div>
    <div class="flex flex-col">
      <p class="font-semibold mb-4">Legal</p>
      <RouterLink to="/privacy" class="text-sm hover:underline mb-2">
        Privacy Policy
      </RouterLink>
      <RouterLink to="/tos" class="text-sm hover:underline">
        Terms of Service
      </RouterLink>
    </div>
  </footer>
</template>
