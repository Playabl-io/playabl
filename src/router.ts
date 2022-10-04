import { createRouter, createWebHistory } from "vue-router";

import IndexPage from "@/pages/IndexPage.vue";
import InvitePage from "@/pages/InvitePage.vue";
import SignIn from "@/pages/SignIn.vue";
import ProfilePage from "@/pages/Profile/ProfilePage.vue";
import NotificationsPage from "@/pages/Profile/NotificationsPage.vue";
import MediaPage from "@/pages/Profile/MediaPage.vue";
import SettingsPage from "@/pages/Profile/SettingsPage.vue";
import MessagesPage from "@/pages/Profile/MessagesPage.vue";
import CommunitiesAll from "@/pages/CommunitiesAll.vue";
import CommunitiesJoined from "@/pages/CommunitiesJoined.vue";
import CommunitiesManage from "@/pages/CommunitiesManage.vue";
import CommunityBase from "@/pages/Community/CommunityBase.vue";
import CommunityHome from "@/pages/Community/CommunityHome.vue";
import CommunityFeed from "@/pages/Community/CommunityFeed.vue";
import GamesJoined from "@/pages/GamesJoined.vue";
import GamesBrowse from "@/pages/GamesBrowse.vue";
import GamesManage from "@/pages/GamesManage.vue";
import GameBase from "@/pages/Game/GameBase.vue";
import GameHome from "@/pages/Game/GameHome.vue";
import NotFound from "@/pages/NotFound.vue";
import TosPage from "@/pages/TosPage.vue";
import PrivacyPolicy from "@/pages/PrivacyPolicy.vue";
import { store } from "./store";

const routes = [
  {
    path: "/",
    component: IndexPage,
    meta: {
      title: "Playabl",
    },
  },
  {
    path: "/invite/:invite_id",
    component: InvitePage,
    meta: {
      title: "Playabl",
    },
  },
  {
    path: "/login",
    component: SignIn,
    meta: {
      title: "Playabl - Sign In",
    },
  },
  {
    path: "/profile",
    component: ProfilePage,
    meta: {
      title: "Playabl - Profile",
      requiresAuth: true,
    },
  },
  {
    path: "/notifications",
    component: NotificationsPage,
    meta: {
      title: "Playabl - Notifications",
      requiresAuth: true,
    },
  },
  {
    path: "/media",
    component: MediaPage,
    meta: {
      title: "Playabl - Media",
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    component: SettingsPage,
    meta: {
      title: "Playabl - Settings",
      requiresAuth: true,
    },
  },
  {
    path: "/messages",
    component: MessagesPage,
    meta: {
      title: "Playabl - Messages",
      requiresAuth: true,
    },
  },
  {
    path: "/communities/joined",
    component: CommunitiesJoined,
    meta: {
      title: "Playabl - Communities",
      requiresAuth: true,
    },
  },
  {
    path: "/communities/browse",
    component: CommunitiesAll,
    meta: {
      title: "Playabl - Communities",
      requiresAuth: true,
    },
  },
  {
    path: "/communities/manage",
    component: CommunitiesManage,
    meta: {
      title: "Playabl - Communities",
      requiresAuth: true,
    },
  },
  {
    path: "/communities/new",
    component: () => import("@/pages/CommunityNew.vue"),
    meta: {
      title: "Playabl - New Community",
      requiresAuth: true,
    },
  },
  {
    path: "/communities/:community_id",
    component: CommunityBase,
    meta: {
      title: "Playabl - Community",
      requiresAuth: true,
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
        component: () => import("@/pages/Community/CommunityCalendar.vue"),
      },
      {
        path: "manage",
        component: () => import("@/pages/Community/CommunityManage.vue"),
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
      title: "Playabl - Games",
      requiresAuth: true,
    },
  },
  {
    path: "/games/browse",
    component: GamesBrowse,
    meta: {
      title: "Playabl - Games",
      requiresAuth: true,
    },
  },
  {
    path: "/games/manage",
    component: GamesManage,
    meta: {
      title: "Playabl - Games",
      requiresAuth: true,
    },
  },
  {
    path: "/games/new",
    component: () => import("@/pages/GameNew.vue"),
    meta: {
      title: "Playabl - New Game",
      requiresAuth: true,
    },
  },
  {
    path: "/games/:game_id",
    component: GameBase,
    meta: {
      title: "Playabl - Community",
    },
    children: [
      {
        path: "",
        component: GameHome,
      },
      {
        path: "details",
        component: () => import("@/pages/Game/GameDetails.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "messages",
        component: () => import("@/pages/Game/GameMessages.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "manage",
        component: () => import("@/pages/Game/GameManage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/tos",
    component: TosPage,
    meta: {
      title: "Playable - Terms of Service",
    },
  },
  {
    path: "/privacy",
    component: PrivacyPolicy,
    meta: {
      title: "Playable - Privacy Policy",
    },
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
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
