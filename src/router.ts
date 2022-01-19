import { createRouter, createWebHistory } from "vue-router";

import Index from "@/pages/Index.vue";
import SignIn from "@/pages/SignIn.vue";
import Profile from "@/pages/Profile.vue";
import CommunitiesAll from "@/pages/CommunitiesAll.vue";
import CommunitiesJoined from "@/pages/CommunitiesJoined.vue";
import CommunitiesManage from "@/pages/CommunitiesManage.vue";
import CommunityNew from "@/pages/CommunityNew.vue";
import CommunityBase from "@/pages/CommunityBase.vue";
import CommunityHome from "@/pages/CommunityHome.vue";
import CommunityFeed from "@/pages/CommunityFeed.vue";
import CommunityCalendar from "@/pages/CommunityCalendar.vue";
import CommunityManage from "@/pages/CommunityManage.vue";
import Games from "@/pages/Games.vue";
import { store } from "./store";

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
    path: "/communities/joined",
    component: CommunitiesJoined,
    meta: {
      title: "Playout - Communities",
    },
  },
  {
    path: "/communities/all",
    component: CommunitiesAll,
    meta: {
      title: "Playout - Communities",
    },
  },
  {
    path: "/communities/manage",
    component: CommunitiesManage,
    meta: {
      title: "Playout - Communities",
    },
  },
  {
    path: "/communities/new",
    component: CommunityNew,
    meta: {
      title: "Playout - New Community",
    },
  },
  {
    path: "/communities/:community_id",
    component: CommunityBase,
    meta: {
      title: "Playout - Community",
    },
    children: [
      {
        path: "",
        component: CommunityHome,
      },
      {
        path: "feed",
        component: CommunityFeed,
      },
      {
        path: "calendar",
        component: CommunityCalendar,
      },
      {
        path: "manage",
        component: CommunityManage,
      },
    ],
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

router.beforeEach((to, from) => {
  // instead of having to check every route record with
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !store.user) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    return {
      path: "/sign-in",
      // save the location we were at to come back later
      query: { redirect: to.fullPath },
    };
  }
});

export default router;
