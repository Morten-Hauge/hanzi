<script>
export default {
  name: "SplashClassic",
};
</script>

<template>
  <main class="splash">
    <section class="splash-intro">
      <div class="splash-content">
        <!-- The logo (.logo-mark in main.css) is the visible title; screen
             readers get the text. -->
        <h1 class="splash-title">
          <span class="logo-mark splash-logo" aria-hidden="true"></span>
          <span class="visually-hidden">Hànzì practise</span>
        </h1>
        <p class="splash-text">
          Learn 30 of the most common Chinese characters
        </p>
        <RouterLink to="/quiz" class="button next-button splash-button"
          >Let’s go!</RouterLink
        >
      </div>
      <!-- Decorative 汉字 brush artwork, right of the text (desktop only). -->
      <div class="splash-art" aria-hidden="true"></div>
    </section>
    <div class="splash-image" aria-hidden="true"></div>
  </main>
</template>
