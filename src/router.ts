import { createRouter, createWebHistory } from "vue-router";

import Index from "@/pages/Index.vue";
import Invite from "@/pages/Invite.vue";
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
import GamesJoined from "@/pages/GamesJoined.vue";
import GamesBrowse from "@/pages/GamesBrowse.vue";
import GamesManage from "@/pages/GamesManage.vue";
import GameNew from "@/pages/GameNew.vue";
import GameBase from "@/pages/GameBase.vue";
import GameHome from "@/pages/GameHome.vue";
import GameMessages from "@/pages/GameMessages.vue";
import GameManage from "@/pages/GameManage.vue";
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
    path: "/invite/:invite_id",
    component: Invite,
    meta: {
      title: "Playout",
    },
  },
  {
    path: "/login",
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
      requiresAuth: true,
    },
  },
  {
    path: "/communities/joined",
    component: CommunitiesJoined,
    meta: {
      title: "Playout - Communities",
      requiresAuth: true,
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
      requiresAuth: true,
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
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "calendar",
        component: CommunityCalendar,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "manage",
        component: CommunityManage,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/games/joined",
    component: GamesJoined,
    meta: {
      title: "Playout - Games",
      requiresAuth: true,
    },
  },
  {
    path: "/games/browse",
    component: GamesBrowse,
    meta: {
      title: "Playout - Games",
    },
  },
  {
    path: "/games/manage",
    component: GamesManage,
    meta: {
      title: "Playout - Games",
      requiresAuth: true,
    },
  },
  {
    path: "/games/new",
    component: GameNew,
    meta: {
      title: "Playout - New Game",
      requiresAuth: true,
    },
  },
  {
    path: "/games/:game_id",
    component: GameBase,
    meta: {
      title: "Playout - Community",
    },
    children: [
      {
        path: "",
        component: GameHome,
      },
      {
        path: "messages",
        component: GameMessages,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "manage",
        component: GameManage,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  // instead of having to check every route record with
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !store.user) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    return {
      path: "/login",
      // save the location we were at to come back later
      query: { redirect: to.fullPath },
    };
  }
});

export default router;
