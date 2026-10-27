import { createRouter, createWebHistory } from "vue-router";
import SplashView from "../views/SplashView.vue";
import HomeView from "../views/HomeView.vue";
import QuizOptions from "../components/QuizOptions.vue";
import hanziData from "@/stores/hanziData.json";

// The published address, for the canonical link (see index.html).
const SITE_URL = "https://www.morten-hauge.com/hanzi/";
const SITE_TITLE = "Hànzì – Chinese character practice";

// Each quiz mode is a child route; HomeView passes the options and answer
// state into QuizOptions and picks the mode from the route name.
// meta.title is the browser tab title for that page.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "splash",
      component: SplashView,
      meta: { title: SITE_TITLE },
    },
    {
      path: "/quiz",
      component: HomeView,
      children: [
        {
          path: "",
          name: "pinyin",
          component: QuizOptions,
          meta: { title: "Pinyin quiz – Hànzì" },
        },
        {
          path: "english",
          name: "english",
          component: QuizOptions,
          meta: { title: "English quiz – Hànzì" },
        },
        {
          path: "character",
          name: "character",
          component: QuizOptions,
          meta: { title: "Character quiz – Hànzì" },
        },
      ],
    },
    {
      path: "/browse",
      name: "browse",
      component: () => import("../views/BrowseView.vue"),
      meta: { title: `All ${hanziData.length} characters – Hànzì` },
    },
    // Anything else (old or mistyped links) goes to the start page.
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// Tab title and canonical link follow the current page.
router.afterEach((to) => {
  document.title = to.meta.title || SITE_TITLE;
  const canonical = document.querySelector('link[rel="canonical"]');
  // With a trailing slash (".../hanzi/browse/"), the address of the page's
  // own copy of index.html in the build (see vite.config.js).
  const page = to.path.replace(/^\/|\/$/g, "");
  if (canonical) canonical.href = SITE_URL + (page ? `${page}/` : "");
});

export default router;
