<script>
export default {
  name: "AppFooter",
  computed: {
    year() {
      return new Date().getFullYear();
    },
  },
  // Pages fill the screen minus header and footer (--footer-h in main.css),
  // so the footer is visible whenever the content fits. The footer's real
  // height is measured here and kept in sync, so padding or text changes
  // never push it below the screen.
  mounted() {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--footer-h",
        `${this.$refs.footer.getBoundingClientRect().height}px`
      );
    };
    setHeight();
    this.resizeObserver = new ResizeObserver(setHeight);
    this.resizeObserver.observe(this.$refs.footer);
  },
  unmounted() {
    this.resizeObserver.disconnect();
  },
};
</script>

<template>
  <!-- Shown under every page (see App.vue); styles in FOOTER in main.css. -->
  <footer ref="footer" class="app-footer">
    <div class="app-footer-inner">
      <div class="app-footer-about">
        <span class="app-footer-title">Hànzì</span>
        <span
          >A passion project by
          <a href="https://morten-hauge.com" target="_blank" rel="noopener"
            >Morten Hauge</a
          ></span
        >
      </div>
     
    </div>
  </footer>
</template>
