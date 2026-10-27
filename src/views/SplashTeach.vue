<script>
// Landing page that "teaches" 汉字 first, then starts the quiz.
// Styles: SPLASH (TEACH) in main.css. Chosen in src/config.js.
export default {
  name: "SplashTeach",
};
</script>

<template>
  <main class="splash splash-teach">
    <!-- Same structure and classes as the app header (App.vue), so the
         wordmark has exactly the same size and position as on the quiz. -->
    <header class="teach-header">
      <div class="app-header-inner">
        <RouterLink to="/" class="app-logo" aria-label="Hànzì, start page">
          <span class="logo-mark app-logo-mark" aria-hidden="true"></span>
        </RouterLink>
      </div>
    </header>

    <div class="teach-column">
      <section class="teach-hero">
        <figure class="teach-figure">
          <!-- Brush 汉字 artwork; the caption below reads it. -->
          <div class="splash-art teach-art" aria-hidden="true"></div>
          <figcaption class="teach-caption">
            <span class="teach-syllable">
              <span class="visually-hidden" lang="zh-Hans">汉</span>
              <span class="teach-pinyin">hàn</span>
              <span class="teach-gloss">Han, Chinese</span>
            </span>
            <span class="teach-syllable">
              <span class="visually-hidden" lang="zh-Hans">字</span>
              <span class="teach-pinyin">zì</span>
              <span class="teach-gloss">character</span>
            </span>
          </figcaption>
        </figure>

        <!-- Desktop: right of the characters. Phones: below them. -->
        <div class="teach-intro">
          <h1 class="teach-title">You just read your first two characters</h1>
          <p class="teach-text">
            Next up: the 30 most common ones, one short quiz at a time.
          </p>
          <RouterLink to="/quiz" class="button next-button teach-cta">
            Start practicing
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- The terraces photo, exactly as on the classic splash (.splash-image):
         fills the rest of the screen, its top fading into the sky. -->
    <div class="splash-image" aria-hidden="true"></div>
  </main>
</template>
