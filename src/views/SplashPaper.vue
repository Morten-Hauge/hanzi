<script>
import inkwashPng from "@/assets/terraces-inkwash.png";
import inkwashWebp from "@/assets/terraces-inkwash.webp";

// Paper landing page: a copy of the ink-wash splash with no navy column.
// A rounded paper box inside a thin navy frame; the paper and the ink-wash
// terraces fill the box. The 汉字 sits on the left and the headline on the
// right, both in navy. No footer bar; the credit sits top right, opposite
// the wordmark (see App.vue).
// Styles: SPLASH (PAPER) in main.css. Chosen in src/config.js.
export default {
  name: "SplashPaper",
  data() {
    return {
      inkwashPng,
      inkwashWebp,
    };
  },
};
</script>

<template>
  <main class="splash splash-paper">
    <!-- The page is a navy frame around this rounded paper box. -->
    <div class="paper-frame">
      <header class="paper-top">
        <RouterLink to="/" class="paper-logo" aria-label="Hànzì, start page">
          <span class="logo-mark paper-logo-mark" aria-hidden="true"></span>
        </RouterLink>
        <p class="paper-credit">
          A passion project by
          <a href="https://morten-hauge.com" target="_blank" rel="noopener"
            >Morten Hauge</a
          >
        </p>
      </header>

      <div class="paper-content">
        <!-- 汉字 in a handwriting workbook's practice grid (田字格): each
             character in its own square cell with a dashed cross, pinyin
             above, meaning below. The brush artwork is one image with both
             characters; each cell shows its own half (see main.css). -->
        <div class="tz-pair">
          <div class="tz-char">
            <span class="tz-pinyin">hàn</span>
            <span class="visually-hidden" lang="zh-Hans">汉</span>
            <div class="tz-cell" aria-hidden="true">
              <span class="tz-glyph tz-han"></span>
            </div>
            <span class="tz-gloss">Chinese</span>
          </div>
          <div class="tz-char">
            <span class="tz-pinyin">zì</span>
            <span class="visually-hidden" lang="zh-Hans">字</span>
            <div class="tz-cell" aria-hidden="true">
              <span class="tz-glyph tz-zi"></span>
            </div>
            <span class="tz-gloss">character</span>
          </div>
        </div>

        <div class="paper-intro">
          <h1 class="paper-title">
            You just read your first two characters
          </h1>
          <p class="paper-lead">
            Next up: the 30 most common ones, one short quiz at a time.
          </p>
          <RouterLink to="/quiz" class="split-cta paper-cta"
            >Start practicing</RouterLink
          >
        </div>
      </div>

      <!-- Decorative ink-wash terraces across the full width: WebP, with the
         PNG as fallback. -->
      <picture class="paper-wash">
        <source :srcset="inkwashWebp" type="image/webp" />
        <img :src="inkwashPng" alt="" />
      </picture>
    </div>
  </main>
</template>
