<script>
export default {
  name: "QuizOptions",
  props: {
    options: {
      type: Array,
      required: true,
    },
    mode: {
      type: String,
      default: "pinyin",
    },
    selectedIndex: {
      type: Number,
      default: null,
    },
    answerState: {
      type: String,
      default: null,
    },
  },
  emits: ["select", "next"],
  methods: {
    optionClass(option, index) {
      const classes = { "option-hanzi": this.mode === "character" };
      if (!this.answerState) return classes;
      if (option.correct) classes["button-correct"] = true;
      else if (index === this.selectedIndex) classes["button-wrong"] = true;
      else classes["option-dimmed"] = true;
      return classes;
    },
  },
};
</script>

<template>
  <div class="quiz-options">
    <section class="button-container">
      <button
        v-for="(option, index) in options"
        :key="option.id"
        class="button option"
        :class="optionClass(option, index)"
        :disabled="answerState !== null"
        @click="$emit('select', index)"
      >
        <!-- Small number in the top-left corner. -->
        <kbd class="option-key">{{ index + 1 }}</kbd>
        <!-- Answers are characters in Character mode: marked as Chinese. -->
        <span
          class="option-label"
          :lang="mode === 'character' ? 'zh-Hans' : undefined"
          >{{ option.label }}</span
        >
        <!-- After answering: ✓ on the right answer, ✗ on a wrong pick, so
             right/wrong doesn't rely on green vs red alone. -->
        <span
          v-if="answerState && option.correct"
          class="option-mark"
          aria-hidden="true"
          ><svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" /></svg
        ></span>
        <span
          v-else-if="answerState && index === selectedIndex"
          class="option-mark"
          aria-hidden="true"
          ><svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7l10 10M17 7L7 17" /></svg
        ></span>
        <span v-if="answerState && option.correct" class="visually-hidden">
          (correct answer)</span
        >
        <span
          v-else-if="answerState && index === selectedIndex"
          class="visually-hidden"
        >
          (your answer, wrong)</span
        >
      </button>
    </section>
    <button
      v-if="answerState === 'wrong'"
      class="button next-button"
      @click="$emit('next')"
    >
      Next
    </button>
  </div>
</template>
