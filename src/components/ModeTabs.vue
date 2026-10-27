<script>
import { QUIZ_MODES, modeFromRoute } from "@/quiz/modes";

// Quiz mode tabs: folder-style tabs forming the top edge of the answer
// panel, on mobile and desktop (see MODE TABS in main.css).
// Each tab is a link to its mode's route; arrow keys, Home and End move
// between tabs like a standard tablist.
export default {
  name: "ModeTabs",
  props: {
    // id of the answers panel the tabs control.
    panelId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      modes: QUIZ_MODES,
    };
  },
  computed: {
    activeIndex() {
      const mode = modeFromRoute(this.$route);
      return this.modes.findIndex((item) => item.mode === mode);
    },
  },
  methods: {
    tabId(item) {
      return `mode-tab-${item.mode}`;
    },
    onKeydown(event) {
      const last = this.modes.length - 1;
      const moves = {
        ArrowRight: this.activeIndex === last ? 0 : this.activeIndex + 1,
        ArrowLeft: this.activeIndex === 0 ? last : this.activeIndex - 1,
        Home: 0,
        End: last,
      };
      if (!(event.key in moves)) return;
      event.preventDefault();
      const item = this.modes[moves[event.key]];
      this.$router.push(item.to);
      this.$nextTick(() => document.getElementById(this.tabId(item))?.focus());
    },
  },
};
</script>

<template>
  <nav class="mode-tabs" role="tablist" aria-label="Quiz mode">
    <!-- The panel-coloured "active tab" that slides to the selected mode,
         like the Quiz/Study switch. -->
    <span
      class="mode-tabs-indicator"
      :style="{ transform: `translateX(${activeIndex * 100}%)` }"
      aria-hidden="true"
    ></span>
    <RouterLink
      v-for="(item, index) in modes"
      :id="tabId(item)"
      :key="item.to"
      :to="item.to"
      class="mode-tab"
      :class="{
        'mode-tab-active': index === activeIndex,
        'tab-before-active': index === activeIndex - 1,
        'tab-after-active': index === activeIndex + 1,
      }"
      role="tab"
      :aria-selected="index === activeIndex ? 'true' : 'false'"
      :aria-controls="panelId"
      :tabindex="index === activeIndex ? 0 : -1"
      @keydown="onKeydown"
    >
      <span class="mode-tab-label">{{ item.label }}</span>
      <span class="mode-tab-hint">{{ item.hint }}</span>
    </RouterLink>
  </nav>
</template>
