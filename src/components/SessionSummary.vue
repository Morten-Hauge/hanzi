<script>
import { chineseVoiceAvailable, speak } from "@/quiz/speech";

export default {
  name: "SessionSummary",
  props: {
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    // Entries missed on the first attempt.
    missed: {
      type: Array,
      required: true,
    },
    // true/false per card, in session order.
    results: {
      type: Array,
      required: true,
    },
    bestStreak: {
      type: Number,
      required: true,
    },
    // e.g. "Pinyin" — the mode the session ended in.
    modeLabel: {
      type: String,
      required: true,
    },
  },
  emits: ["practiceMissed", "newSession"],
  computed: {
    canSpeak() {
      return chineseVoiceAvailable.value;
    },
  },
  methods: {
    play(entry) {
      if (this.canSpeak) speak(entry.hanzi);
    },
  },
};
</script>

<template>
  <!-- Below 1024px everything stacks: score and stats, review list,
       buttons. From 1024px: score, stats and buttons on the left, the
       review grid on the right (see SUMMARY in main.css). -->
  <section class="summary">
    <div class="summary-head">
      <h2 class="summary-label">Session complete</h2>
      <p class="summary-score">
        <span class="summary-score-number">{{ score }}/{{ total }}</span>
      </p>

      <ol
        class="result-strip"
        role="img"
        :aria-label="`${score} correct, ${missed.length} missed`"
      >
        <li
          v-for="(correct, index) in results"
          :key="index"
          class="result-block"
          :class="correct ? 'result-correct' : 'result-missed'"
        >
          <!-- ✓ / ✗ so correct vs missed doesn't rely on colour alone. -->
          <svg v-if="correct" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7l10 10M17 7L7 17" />
          </svg>
        </li>
      </ol>

      <dl class="summary-stats">
        <div class="stat-tile">
          <dt>Correct</dt>
          <dd>{{ score }}</dd>
        </div>
        <div class="stat-tile">
          <dt>Wrong</dt>
          <dd>{{ missed.length }}</dd>
        </div>
        <div class="stat-tile">
          <!-- "Streak" on phones, where the tile is narrow. -->
          <dt>
            <span class="stat-label-long">Best streak</span>
            <span class="stat-label-short">Streak</span>
          </dt>
          <dd>{{ bestStreak }}</dd>
        </div>
      </dl>
    </div>

    <!-- Only when something was missed; a clean sweep shows no review. -->
    <div v-if="missed.length" class="summary-review">
      <h3 class="summary-review-title">You missed these</h3>
      <ul class="review-grid">
        <li v-for="entry in missed" :key="entry.hanzi">
          <!-- A button only when it can do something (play the sound). -->
          <component
            :is="canSpeak ? 'button' : 'div'"
            class="review-card"
            :type="canSpeak ? 'button' : undefined"
            :aria-label="
              canSpeak
                ? `${entry.hanzi}, ${entry.pinyin}, ${entry.english}. Play pronunciation`
                : undefined
            "
            @click="play(entry)"
          >
            <span class="review-hanzi" lang="zh-Hans">{{ entry.hanzi }}</span>
            <span class="review-pinyin">{{ entry.pinyin }}</span>
            <span class="review-english">{{ entry.english }}</span>
          </component>
        </li>
      </ul>
    </div>

    <div class="summary-actions">
      <button
        v-if="missed.length"
        class="button next-button summary-button"
        @click="$emit('practiceMissed')"
      >
        Practice the {{ missed.length }} missed
      </button>
      <p v-else class="summary-clean">
        Clean sweep — every card right on the first try
      </p>
      <button
        class="button summary-button summary-secondary"
        @click="$emit('newSession')"
      >
        New session
      </button>
    </div>
  </section>
</template>
