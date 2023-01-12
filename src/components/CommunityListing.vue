<template>
  <article class="grid gap-6 w-full max-w-4xl mx-auto">
    <div
      class="w-full relative"
      :class="{
        'aspect-w-16 aspect-h-9': coverImageUrl,
      }"
    >
      <img
        v-if="coverImageUrl"
        class="w-full h-full object-center object-cover shadow-md rounded-lg"
        :src="coverImageUrl"
        :alt="`${community.name} cover image`"
        loading="lazy"
      />
      <div
        :class="{
          'bg-gray-100': !coverImageUrl,
          'bg-gradient-to-b from-transparent via-transparent to-black':
            coverImageUrl,
        }"
        class="w-full h-full flex flex-col justify-end rounded-lg p-4"
      >
        <div class="flex gap-4 items-center">
          <router-link
            :to="`/communities/${community.url_short_name || community.id}`"
            class="hover:underline"
            :class="{
              'text-white': coverImageUrl,
            }"
          >
            <heading level="h5">
              {{ community.name }}
            </heading>
          </router-link>
          <Tooltip v-if="community.code_of_conduct_url">
            <template #trigger="{ toggleTooltip }">
              <CheckBadgeIcon
                v-if="community.code_of_conduct_url"
                class="text-green-500 h-6 w-6 relative"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip> Has a community code of conduct </template>
          </Tooltip>
          <Tooltip v-if="community.allow_public_signup">
            <template #trigger="{ toggleTooltip }">
              <BoltIcon
                v-if="community.allow_public_signup"
                class="text-yellow-500 h-6 w-6"
                @mouseenter="toggleTooltip"
                @mouseleave="toggleTooltip"
                @focus="toggleTooltip"
                @blur="toggleTooltip"
              />
            </template>
            <template #tooltip> This community allows public joining </template>
          </Tooltip>
        </div>
        <a
          class="mt-1 hover:underline active:underline text-sm"
          :class="{
            'text-neutral-200': coverImageUrl,
          }"
          :href="community.website"
          target="_blank"
          rel="noreferrer noopener"
        >
          {{ community.website }}
        </a>
      </div>
    </div>

    <section class="flex flex-col">
      <div class="flex flex-wrap gap-4 mt-4">
        <div
          v-for="gameType in community.game_types"
          :key="gameType"
          class="rounded-xl px-2 bg-blue-500 text-white"
        >
          {{ gameType }}
        </div>
      </div>
      <p class="prose dark:prose-invert my-6 whitespace-pre-wrap">
        {{ community.description }}
      </p>

      <div
        class="mt-auto text-xs text-slate-600 dark:text-slate-400 flex space-x-4 items-center"
      >
        <a
          v-if="community.twitter"
          class="underline"
          target="_blank"
          rel="noreferrer noopener"
          :href="`https://twitter.com/${community.twitter}`"
        >
          <svg
            width="16px"
            viewBox="0 0 256 209"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
          >
            <g>
              <path
                d="M256,25.4500259 C246.580841,29.6272672 236.458451,32.4504868 225.834156,33.7202333 C236.678503,27.2198053 245.00583,16.9269929 248.927437,4.66307685 C238.779765,10.6812633 227.539325,15.0523376 215.57599,17.408298 C205.994835,7.2006971 192.34506,0.822 177.239197,0.822 C148.232605,0.822 124.716076,24.3375931 124.716076,53.3423116 C124.716076,57.4586875 125.181462,61.4673784 126.076652,65.3112644 C82.4258385,63.1210453 43.7257252,42.211429 17.821398,10.4359288 C13.3005011,18.1929938 10.710443,27.2151234 10.710443,36.8402889 C10.710443,55.061526 19.9835254,71.1374907 34.0762135,80.5557137 C25.4660961,80.2832239 17.3681846,77.9207088 10.2862577,73.9869292 C10.2825122,74.2060448 10.2825122,74.4260967 10.2825122,74.647085 C10.2825122,100.094453 28.3867003,121.322443 52.413563,126.14673 C48.0059695,127.347184 43.3661509,127.988612 38.5755734,127.988612 C35.1914554,127.988612 31.9009766,127.659938 28.694773,127.046602 C35.3777973,147.913145 54.7742053,163.097665 77.7569918,163.52185 C59.7820257,177.607983 37.1354036,186.004604 12.5289147,186.004604 C8.28987161,186.004604 4.10888474,185.75646 0,185.271409 C23.2431033,200.173139 50.8507261,208.867532 80.5109185,208.867532 C177.116529,208.867532 229.943977,128.836982 229.943977,59.4326002 C229.943977,57.1552968 229.893412,54.8901664 229.792282,52.6381454 C240.053257,45.2331635 248.958338,35.9825545 256,25.4500259"
                fill="#55acee"
              ></path>
            </g>
          </svg>
        </a>
        <a
          v-if="community.facebook"
          class="underline"
          target="_blank"
          rel="noreferrer noopener"
          :href="`https://facebook.com/${community.facebook}`"
        >
          <svg
            width="16px"
            viewBox="0 0 256 256"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
          >
            <g>
              <path
                d="M241.871,256.001 C249.673,256.001 256,249.675 256,241.872 L256,14.129 C256,6.325 249.673,0 241.871,0 L14.129,0 C6.324,0 0,6.325 0,14.129 L0,241.872 C0,249.675 6.324,256.001 14.129,256.001 L241.871,256.001"
                fill="#395185"
              ></path>
              <path
                d="M176.635,256.001 L176.635,156.864 L209.912,156.864 L214.894,118.229 L176.635,118.229 L176.635,93.561 C176.635,82.375 179.742,74.752 195.783,74.752 L216.242,74.743 L216.242,40.188 C212.702,39.717 200.558,38.665 186.43,38.665 C156.932,38.665 136.738,56.67 136.738,89.736 L136.738,118.229 L103.376,118.229 L103.376,156.864 L136.738,156.864 L136.738,256.001 L176.635,256.001"
                fill="#FFFFFF"
              ></path>
            </g>
          </svg>
        </a>
        <a
          v-if="community.discord"
          class="underline"
          target="_blank"
          rel="noreferrer noopener"
          :href="community.discord"
        >
          <svg
            width="16px"
            viewBox="0 0 256 199"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
          >
            <g>
              <path
                d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                fill="#5865F2"
                fill-rule="nonzero"
              ></path>
            </g>
          </svg>
        </a>
        <a
          v-if="community.slack"
          class="underline"
          target="_blank"
          rel="noreferrer noopener"
          :href="community.slack"
        >
          <svg
            width="16px"
            viewBox="0 0 256 256"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
          >
            <g>
              <path
                d="M53.8412698,161.320635 C53.8412698,176.152381 41.8539683,188.139683 27.0222222,188.139683 C12.1904762,188.139683 0.203174603,176.152381 0.203174603,161.320635 C0.203174603,146.488889 12.1904762,134.501587 27.0222222,134.501587 L53.8412698,134.501587 L53.8412698,161.320635 Z M67.2507937,161.320635 C67.2507937,146.488889 79.2380952,134.501587 94.0698413,134.501587 C108.901587,134.501587 120.888889,146.488889 120.888889,161.320635 L120.888889,228.368254 C120.888889,243.2 108.901587,255.187302 94.0698413,255.187302 C79.2380952,255.187302 67.2507937,243.2 67.2507937,228.368254 L67.2507937,161.320635 Z"
                fill="#E01E5A"
              ></path>
              <path
                d="M94.0698413,53.6380952 C79.2380952,53.6380952 67.2507937,41.6507937 67.2507937,26.8190476 C67.2507937,11.9873016 79.2380952,-7.10542736e-15 94.0698413,-7.10542736e-15 C108.901587,-7.10542736e-15 120.888889,11.9873016 120.888889,26.8190476 L120.888889,53.6380952 L94.0698413,53.6380952 Z M94.0698413,67.2507937 C108.901587,67.2507937 120.888889,79.2380952 120.888889,94.0698413 C120.888889,108.901587 108.901587,120.888889 94.0698413,120.888889 L26.8190476,120.888889 C11.9873016,120.888889 0,108.901587 0,94.0698413 C0,79.2380952 11.9873016,67.2507937 26.8190476,67.2507937 L94.0698413,67.2507937 Z"
                fill="#36C5F0"
              ></path>
              <path
                d="M201.549206,94.0698413 C201.549206,79.2380952 213.536508,67.2507937 228.368254,67.2507937 C243.2,67.2507937 255.187302,79.2380952 255.187302,94.0698413 C255.187302,108.901587 243.2,120.888889 228.368254,120.888889 L201.549206,120.888889 L201.549206,94.0698413 Z M188.139683,94.0698413 C188.139683,108.901587 176.152381,120.888889 161.320635,120.888889 C146.488889,120.888889 134.501587,108.901587 134.501587,94.0698413 L134.501587,26.8190476 C134.501587,11.9873016 146.488889,-1.42108547e-14 161.320635,-1.42108547e-14 C176.152381,-1.42108547e-14 188.139683,11.9873016 188.139683,26.8190476 L188.139683,94.0698413 Z"
                fill="#2EB67D"
              ></path>
              <path
                d="M161.320635,201.549206 C176.152381,201.549206 188.139683,213.536508 188.139683,228.368254 C188.139683,243.2 176.152381,255.187302 161.320635,255.187302 C146.488889,255.187302 134.501587,243.2 134.501587,228.368254 L134.501587,201.549206 L161.320635,201.549206 Z M161.320635,188.139683 C146.488889,188.139683 134.501587,176.152381 134.501587,161.320635 C134.501587,146.488889 146.488889,134.501587 161.320635,134.501587 L228.571429,134.501587 C243.403175,134.501587 255.390476,146.488889 255.390476,161.320635 C255.390476,176.152381 243.403175,188.139683 228.571429,188.139683 L161.320635,188.139683 Z"
                fill="#ECB22E"
              ></path>
            </g>
          </svg>
        </a>
        <a
          v-if="community.patreon"
          class="underline"
          target="_blank"
          rel="noreferrer noopener"
          :href="community.patreon"
        >
          <svg
            width="16px"
            viewBox="0 0 256 247"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
          >
            <g>
              <path
                d="M45.1355837,0 L45.1355837,246.35001 L0,246.35001 L0,0 L45.1355837,0 Z M163.657111,0 C214.65668,0 256,41.3433196 256,92.3428889 C256,143.342458 214.65668,184.685778 163.657111,184.685778 C112.657542,184.685778 71.3142222,143.342458 71.3142222,92.3428889 C71.3142222,41.3433196 112.657542,0 163.657111,0 Z"
                fill="#FF424D"
              ></path>
            </g>
          </svg>
        </a>
      </div>
    </section>
  </article>
</template>
<script setup lang="ts">
import Heading from "./Heading.vue";
import { toRefs, PropType, onMounted, ref } from "vue";
import { CheckBadgeIcon, BoltIcon } from "@heroicons/vue/24/outline";
import { Community } from "@/typings/Community";
import Tooltip from "./Tooltip.vue";
import { getCoverImageUrl } from "@/api/storage";

const props = defineProps({
  community: {
    type: Object as PropType<Community>,
    required: true,
  },
});

const coverImageUrl = ref("");

onMounted(async () => {
  if (props.community.cover_image) {
    const publicUrl = await getCoverImageUrl(props.community.cover_image);
    if (publicUrl) {
      coverImageUrl.value = publicUrl;
    }
  }
});

toRefs(props);
</script>
