<script>
import AppFooter from "@/components/AppFooter.vue";
import { SPLASH_VARIANT } from "@/config";

const QUIZ_ROUTES = ["pinyin", "english", "character"];

// Position of each top-level page, left to right: Splash, Quiz, Study.
// Moving right pushes the new page in from the right; moving left pops back.
function pageIndex(route) {
  if (route.name === "splash") return 0;
  if (QUIZ_ROUTES.includes(route.name)) return 1;
  if (route.name === "browse") return 2;
  return null;
}

export default {
  components: {
    AppFooter,
  },
  data() {
    return {
      // The quiz link returns to the last quiz mode used.
      quizPath: "/quiz",
      transitionName: "",
      // True while popping back to the splash, when the header leaves.
      headerLeaving: false,
    };
  },
  computed: {
    onQuiz() {
      return QUIZ_ROUTES.includes(this.$route.name);
    },
    onStudy() {
      return this.$route.name === "browse";
    },
    // The splash screen is full-bleed, without the Quiz/Study switch.
    onSplash() {
      return this.$route.name === "splash";
    },
    // No header until the first route is known: before that the router
    // reports an unnamed start location, which would briefly show the
    // header (and fade it out again) when the app opens on the splash.
    showHeader() {
      return this.$route.name !== undefined && !this.onSplash;
    },
    // The split and inkwash splashes have their credit inside the page, so
    // no footer bar there. (Also hidden until the first route is known, like
    // the header.)
    showFooter() {
      if (this.$route.name === undefined) return false;
      const ownCredit = ["split", "inkwash", "paper"].includes(SPLASH_VARIANT);
      return !(this.onSplash && ownCredit);
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        if (QUIZ_ROUTES.includes(to.name)) this.quizPath = to.fullPath;

        // Splash, Quiz and Study slide; anything else switches instantly.
        this.headerLeaving = to.name === "splash" && from !== undefined;
        const toIndex = pageIndex(to);
        const fromIndex = from ? pageIndex(from) : null;
        if (toIndex === null || fromIndex === null || toIndex === fromIndex) {
          this.transitionName = "";
        } else {
          this.transitionName = toIndex > fromIndex ? "push" : "pop";
        }
        // Read before the new page is added (which may already change it).
        this.scrollAtNavigation = window.scrollY;
        this.updateSplashScrollbar();
      },
    },
  },
  methods: {
    // Quiz and Study keep room for a scrollbar, so their width never changes
    // (see SCROLLBAR in main.css). The splash shows no scrollbar at all, so
    // its width differs by the scrollbar's; that switch happens on the first
    // frame of a slide, so the incoming page already has its final width and
    // only the outgoing page shifts, as it starts to move.
    updateSplashScrollbar() {
      document.documentElement.classList.toggle(
        "splash-scrollbar",
        this.onSplash
      );
    },
    // A slide starts at the top of the window: the new page scrolls in from
    // its top. The leaving page is moved up by the old scroll position, so
    // it stays exactly where it was on screen while it slides out (instead
    // of jumping when the shorter page can't be scrolled as far).
    onPageLeave(el) {
      const scrolled = this.scrollAtNavigation;
      if (!this.transitionName || !scrolled) return;
      const top = parseFloat(getComputedStyle(el).top) || 0;
      el.style.top = `${top - scrolled}px`;
      window.scrollTo(0, 0);
    },
    onPageAfterLeave(el) {
      el.style.top = "";
    },
  },
};
</script>

<template>
  <!-- The header only exists outside the splash, so it fades in/out as
       the splash is left or returned to. -->
  <!-- Explicit duration: the animations run on the header's children, not
       on the header itself, so Vue can't detect their length. -->
  <Transition name="header-fade" :duration="450">
    <header v-if="showHeader" class="app-header">
      <!-- Logo left, Quiz/Study switch right, on all screen sizes. The quiz
           mode tabs live in the quiz itself (ModeTabs). -->
      <div class="app-header-inner">
        <!-- The logo is drawn by CSS (.logo-mark in main.css); the link's
             accessible name comes from aria-label. -->
        <RouterLink to="/" class="app-logo" aria-label="Hànzì, start page">
          <span class="logo-mark app-logo-mark" aria-hidden="true"></span>
        </RouterLink>

        <div class="app-switch">
          <!-- Sliding highlight behind the active option, like a native
               segmented control. -->
          <span
            v-if="onQuiz || onStudy"
            class="app-switch-indicator"
            :class="{ 'app-switch-indicator-right': onStudy }"
            aria-hidden="true"
          ></span>
          <RouterLink
            :to="quizPath"
            class="app-switch-link"
            :class="{ 'app-switch-active': onQuiz }"
            >Quiz</RouterLink
          >
          <RouterLink
            to="/browse"
            class="app-switch-link"
            active-class="app-switch-active"
            >Study</RouterLink
          >
        </div>
      </div>
    </header>
  </Transition>
  <div class="route-stage" :class="{ 'header-leaving': headerLeaving }">
    <RouterView v-slot="{ Component }">
      <Transition
        :name="transitionName"
        @leave="onPageLeave"
        @after-leave="onPageAfterLeave"
      >
        <KeepAlive include="HomeView">
          <component :is="Component" class="page" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </div>
  <AppFooter v-if="showFooter" />
</template>
