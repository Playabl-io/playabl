<template>
  <BaseTemplate>
    <div class="mb-6">
      <nav
        v-if="isSmAndLarger"
        class="p-2 rounded-md bg-white shadow-sm w-full flex items-center gap-3"
      >
        <template v-for="link in parsedRoutes">
          <NavMenu v-if="'children' in link" :key="link.label">
            <template #title>
              {{ link.label }}
            </template>
            <template #items>
              <NavMenuItem
                v-for="child in link.children"
                :key="child.label"
                :to="child.path"
              >
                {{ child.label }}
              </NavMenuItem>
            </template>
          </NavMenu>
          <RouterLink
            v-else-if="link.path"
            :key="link.path"
            :to="link.path"
            class="flex gap-4 p-2 rounded-md hover:bg-gray-100 cursor-pointer focus-styles"
            active-class="bg-purple-100 text-brand-500"
          >
            {{ link.label }}
          </RouterLink>
        </template>
      </nav>
      <NavMenu v-else class="bg-white border border-gray-300 rounded-md p-2">
        <template #title>
          {{ route.name }}
        </template>
        <template #items>
          <template v-for="link in routes">
            <div v-if="'children' in link" :key="link.label">
              <p class="text-xs font-semibold">
                {{ link.label }}
              </p>
              <div class="pl-4">
                <NavMenuItem
                  v-for="child in link.children"
                  :key="child.label"
                  :to="child.path"
                >
                  {{ child.label }}
                </NavMenuItem>
              </div>
            </div>
            <NavMenuItem v-else-if="link.path" :key="link.path" :to="link.path">
              {{ link.label }}
            </NavMenuItem>
          </template>
        </template>
      </NavMenu>
    </div>
    <section>
      <slot></slot>
    </section>
  </BaseTemplate>
</template>
<script setup lang="ts">
import { PropType, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { RouterLink, useRoute } from "vue-router";
import { z } from "zod";
import NavMenu from "@/components/Menus/NavMenu.vue";
import BaseTemplate from "./BaseTemplate.vue";
import NavMenuItem from "@/components/Menus/NavMenuItem.vue";
const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmAndLarger = breakpoints.greater("sm");

const route = useRoute();

const routeSchema = z.array(
  z
    .object({
      label: z.string(),
      path: z.string(),
    })
    .or(
      z.object({
        label: z.string(),
        children: z
          .array(
            z.object({
              label: z.string(),
              path: z.string(),
            })
          )
          .min(1),
      })
    )
);
type routeType = z.infer<typeof routeSchema>;

const props = defineProps({
  routes: {
    type: Array as PropType<routeType>,
    required: true,
  },
});

const parsedRoutes = computed(() => routeSchema.parse(props.routes));
</script>
