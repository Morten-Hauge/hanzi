<script>
import terracesPhoto from "@/assets/bg_v3.jpg";

// Split landing page: the 汉字 artwork on a light column (left), the
// headline and button on a navy column (right). Has no footer bar; the
// credit sits in the right column (App.vue hides the shared footer).
// Styles: SPLASH (SPLIT) in main.css. Chosen in src/config.js.
export default {
  name: "SplashSplit",
  data() {
    return {
      terracesPhoto,
    };
  },
};
</script>

<template>
  <main class="splash splash-split">
    <section class="split-art">
      <RouterLink to="/" class="split-logo" aria-label="Hànzì, start page">
        <span class="logo-mark split-logo-mark" aria-hidden="true"></span>
      </RouterLink>

      <figure class="split-figure">
        <!-- Brush 汉字 artwork; the caption below reads it. -->
        <div class="splash-art split-hanzi" aria-hidden="true"></div>
        <figcaption class="split-caption">
          <span class="split-syllable">
            <span class="visually-hidden" lang="zh-Hans">汉</span>
            <span class="split-pinyin">hàn</span>
            <span class="split-gloss">Han, Chinese</span>
          </span>
          <span class="split-syllable">
            <span class="visually-hidden" lang="zh-Hans">字</span>
            <span class="split-pinyin">zì</span>
            <span class="split-gloss">character</span>
          </span>
        </figcaption>
      </figure>

      <img class="split-photo" :src="terracesPhoto" alt="" />
    </section>

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
