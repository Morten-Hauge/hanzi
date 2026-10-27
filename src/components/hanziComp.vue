<script>
import { chineseVoiceAvailable, speak } from "@/quiz/speech";

export default {
  name: "hanziComp",
  props: {
    entry: {
      type: Object,
      required: true,
    },
    // In "character" mode the card shows the meaning and you pick the
    // character; every other mode shows the character.
    mode: {
      type: String,
      default: "pinyin",
    },
    // Show the full answer under the card (after a wrong answer).
    reveal: {
      type: Boolean,
      default: false,
    },
    correct: {
      type: Boolean,
      default: false,
    },
    // Changes for every new card, so the card animates even if the
    // character repeats.
    cardKey: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    showsMeaning() {
      return this.mode === "character";
    },
    // "tall/length" -> ["tall/", "length"]
    meaningParts() {
      return this.entry.english.split(/(?<=\/)/);
    },
    // In meaning → character mode, hearing the word would be a hint, so the
    // speaker only appears once the card is answered.
    showSpeaker() {
      return (
        chineseVoiceAvailable.value &&
        (!this.showsMeaning || this.reveal || this.correct)
      );
    },
  },
  methods: {
    speak() {
      speak(this.entry.hanzi);
    },
  },
};
</script>

<template>
  <section class="hanzi-container">
    <div class="hanzi-stage">
      <Transition name="card" appear>
        <span
          class="hanzi"
          :class="{ 'hanzi-correct': correct, 'hanzi-meaning': showsMeaning }"
          :key="cardKey"
        >
          <!-- <wbr> after each "/" so "tall/length" can wrap there. -->
          <span v-if="showsMeaning"
            ><template v-for="(part, index) in meaningParts" :key="index"
              ><wbr v-if="index > 0" />{{ part }}</template
            ></span
          >
          <span v-else lang="zh-Hans">{{ entry.hanzi }}</span>
          <button
            v-if="showSpeaker"
            class="speaker-button"
            type="button"
            aria-label="Play pronunciation"
            @click="speak"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M4 9v6h4l5 4V5L8 9H4z M16 8.5a4.5 4.5 0 0 1 0 7 M18.5 6a8 8 0 0 1 0 12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </span>
      </Transition>
    </div>
    <!-- Desktop shows the answer with extra info under it. Below 1024px only
         the answer for the current mode is shown (.reveal-extra is hidden),
         to keep the Next button on screen. -->
    <div class="reveal">
      <template v-if="reveal && showsMeaning">
        <span class="reveal-main reveal-hanzi" lang="zh-Hans">{{
          entry.hanzi
        }}</span>
        <span class="reveal-sub reveal-extra">{{ entry.pinyin }}</span>
      </template>
      <template v-else-if="reveal">
        <span
          class="reveal-main"
          :class="{ 'reveal-extra': mode === 'english' }"
          >{{ entry.pinyin }}</span
        >
        <span
          class="reveal-sub"
          :class="{
            'reveal-extra': mode === 'pinyin',
            'reveal-answer': mode === 'english',
          }"
          >{{ entry.english }}</span
        >
      </template>
    </div>
  </section>
</template>
