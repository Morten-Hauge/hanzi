<script>
import { SPLASH_VARIANT } from "@/config";
import SplashClassic from "./SplashClassic.vue";
import SplashInkwash from "./SplashInkwash.vue";
import SplashSplit from "./SplashSplit.vue";
import SplashTeach from "./SplashTeach.vue";

const VARIANTS = {
  classic: "SplashClassic",
  inkwash: "SplashInkwash",
  split: "SplashSplit",
  teach: "SplashTeach",
};

// The splash route. Renders the variant chosen in src/config.js; all keep
// the root class "splash", which the page transitions rely on.
export default {
  name: "SplashView",
  components: {
    SplashClassic,
    SplashInkwash,
    SplashSplit,
    SplashTeach,
  },
  computed: {
    variant() {
      return VARIANTS[SPLASH_VARIANT] || "SplashTeach";
    },
  },
};
</script>

<template>
  <component :is="variant" />
</template>
