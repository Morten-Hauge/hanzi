<script>
import hanziData from "@/stores/hanziData.json";
import { chineseVoiceAvailable, speak } from "@/quiz/speech";

export default {
  name: "BrowseView",
  data() {
    return {
      hanziData,
    };
  },
  computed: {
    canSpeak() {
      return chineseVoiceAvailable.value;
    },
  },
  methods: {
    play(entry, event) {
      if (!this.canSpeak) return;
      speak(entry.hanzi);
      // Restart the flash even on repeated taps: remove the class, force a
      // reflow, add it again. It's removed again when the animation ends.
      const card = event.currentTarget;
      card.classList.remove("browse-card-flash");
      void card.offsetWidth;
      card.classList.add("browse-card-flash");
    },
    endFlash(event) {
      event.currentTarget.classList.remove("browse-card-flash");
    },
  },
};
</script>

<template>
  <main>
    <!-- Full-width root (main) so the page fully covers the quiz while
         sliding; .browse is the centred content. -->
    <div class="browse">
      <h1 class="browse-title">All {{ hanziData.length }} characters</h1>
      <p v-if="canSpeak" class="browse-hint">Tap a character to hear it.</p>
      <ul class="browse-grid">
        <li v-for="entry in hanziData" :key="entry.hanzi">
          <!-- A button only when it can do something (play the sound). -->
          <component
            :is="canSpeak ? 'button' : 'div'"
            class="browse-card"
            :type="canSpeak ? 'button' : undefined"
            :aria-label="
              canSpeak
                ? `${entry.hanzi}, ${entry.pinyin}, ${entry.english}. Play pronunciation`
                : undefined
            "
            @click="play(entry, $event)"
            @animationend="endFlash"
          >
            <span class="browse-hanzi" lang="zh-Hans">{{ entry.hanzi }}</span>
            <span class="browse-pinyin">{{ entry.pinyin }}</span>
            <span class="browse-english">{{ entry.english }}</span>
          </component>
        </li>
      </ul>
    </div>
  </main>
</template>
