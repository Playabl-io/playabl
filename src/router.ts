import { createRouter, createWebHistory } from "vue-router";

import Index from "@/pages/Index.vue";
import SignIn from "@/pages/SignIn.vue";
import Profile from "@/pages/Profile.vue";
import Communities from "@/pages/Communities.vue";
import NewCommunity from "@/pages/NewCommunity.vue";
import Games from "@/pages/Games.vue";

const routes = [
  {
    path: "/",
    component: Index,
    meta: {
      title: "Playout",
    },
  },
  {
    path: "/sign-in",
    component: SignIn,
    meta: {
      title: "Playout - Sign In",
    },
  },
  {
    path: "/profile",
    component: Profile,
    meta: {
      title: "Playout - Profile",
    },
  },
  {
    path: "/communities",
    component: Communities,
    meta: {
      title: "Playout - Communities",
    },
  },
  {
    path: "/communities/new",
    component: NewCommunity,
    meta: {
      title: "Playout - New Community",
    },
  },
  {
    path: "/games",
    component: Games,
    meta: {
      title: "Playout - Games",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
