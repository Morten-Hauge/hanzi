<script>
import inkwashPng from "@/assets/terraces-inkwash.png";
import inkwashWebp from "@/assets/terraces-inkwash.webp";

// Ink-wash landing page: like SplashSplit (same two columns, same right
// column), but the left column is paper with the navy 汉字 and an ink-wash
// print of the terraces along the bottom (made by scripts/make-inkwash.mjs).
// No footer bar; the credit sits in the right column (see App.vue).
// Styles: SPLASH (INKWASH) in main.css; the layout and right column reuse
// SPLASH (SPLIT). Chosen in src/config.js.
export default {
  name: "SplashInkwash",
  data() {
    return {
      inkwashPng,
      inkwashWebp,
    };
  },
};
</script>

<template>
  <main class="splash splash-split splash-inkwash">
    <section class="ink-art">
      <RouterLink to="/" class="ink-logo" aria-label="Hànzì, start page">
        <span class="logo-mark ink-logo-mark" aria-hidden="true"></span>
      </RouterLink>

      <figure class="ink-figure">
        <!-- Brush 汉字 artwork; the caption below reads it. -->
        <div class="splash-art ink-hanzi" aria-hidden="true"></div>
        <figcaption class="ink-caption">
          <span class="ink-syllable">
            <span class="visually-hidden" lang="zh-Hans">汉</span>
            <span class="ink-pinyin">hàn</span>
            <span class="ink-gloss">Han, Chinese</span>
          </span>
          <span class="ink-syllable">
            <span class="visually-hidden" lang="zh-Hans">字</span>
            <span class="ink-pinyin">zì</span>
            <span class="ink-gloss">character</span>
          </span>
        </figcaption>
      </figure>

      <!-- Decorative ink-wash terraces: WebP, with the PNG as fallback. -->
      <picture class="ink-wash">
        <source :srcset="inkwashWebp" type="image/webp" />
        <img :src="inkwashPng" alt="" />
      </picture>
    </section>

    <!-- Same as SplashSplit's right column (its styles are reused). -->
    <section class="split-text">
      <div class="split-intro">
        <h1 class="split-title">You just read your first two characters</h1>
        <p class="split-lead">
          Next up: the 30 most common ones, one short quiz at a time.
        </p>
        <RouterLink to="/quiz" class="split-cta">Start practicing</RouterLink>
      </div>

      <p class="split-credit">
        A passion project by
        <a href="https://morten-hauge.com" target="_blank" rel="noopener"
          >Morten Hauge</a
        >
      </p>
    </section>
  </main>
</template>
