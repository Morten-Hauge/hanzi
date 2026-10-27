<script>
import hanziData from "@/stores/hanziData.json";
import hanziComp from "@/components/hanziComp.vue";
import SessionSummary from "@/components/SessionSummary.vue";
import ModeTabs from "@/components/ModeTabs.vue";
import { CORRECT_DELAY_MS, SESSION_LENGTH } from "@/quiz/config";
import { buildOptions } from "@/quiz/distractors";
import { Session } from "@/quiz/session";
import { speak, stopSpeaking } from "@/quiz/speech";
import { QUIZ_MODES, modeFromRoute } from "@/quiz/modes";

export default {
  // Kept alive by App.vue, so a session survives a visit to Browse.
  name: "HomeView",
  components: {
    hanziComp,
    SessionSummary,
    ModeTabs,
  },
  data() {
    return {
      modes: QUIZ_MODES,
      currentHanzi: null,
      cardKey: 0,
      // Session progress, copied from the (non-reactive) session.
      cardNumber: 0,
      cardTotal: 0,
      finished: false,
      summary: null, // { score, total, missed } once finished
      // Options per mode for the current card, built the first time that
      // tab is shown, so switching tabs doesn't reshuffle them.
      optionsByMode: {},
      // The answer belongs to the card, not the tab: once answered, every
      // tab shows the card as answered until "Next".
      answerState: null, // null | "correct" | "wrong"
      answeredMode: null,
      selectedIndex: null,
    };
  },
  computed: {
    mode() {
      return modeFromRoute(this.$route);
    },
    // "Pinyin", "English" or "Character".
    modeLabel() {
      return this.modes.find((item) => item.mode === this.mode).label;
    },
    options() {
      return this.optionsByMode[this.mode] || [];
    },
    // Only the tab where the answer was given shows the red pick.
    shownSelectedIndex() {
      return this.mode === this.answeredMode ? this.selectedIndex : null;
    },
    // Card 1 of 15 already shows 1/15 filled.
    progressPercent() {
      return (this.cardNumber / this.cardTotal) * 100;
    },
  },
  watch: {
    mode() {
      if (!this.finished) this.ensureOptions();
    },
  },
  created() {
    this.advanceTimer = null;
    this.startSession(hanziData, SESSION_LENGTH);
  },
  // activated/deactivated (not mounted/unmounted) because of <KeepAlive>:
  // quiz keys must not fire while Browse is showing.
  activated() {
    window.addEventListener("keydown", this.onKeydown);
  },
  deactivated() {
    window.removeEventListener("keydown", this.onKeydown);
    stopSpeaking();
  },
  unmounted() {
    window.removeEventListener("keydown", this.onKeydown);
    clearTimeout(this.advanceTimer);
  },
  methods: {
    startSession(items, length) {
      // Not reactive on purpose: the session holds raw data references.
      this.session = new Session(items, length);
      this.cardTotal = this.session.total;
      this.finished = false;
      this.summary = null;
      this.nextCard();
    },
    nextCard() {
      // No stopSpeaking() here: after a correct answer the card advances in
      // 600 ms, and the word should finish playing over the next card.
      // speak() cancels anything still playing when the next word starts.
      clearTimeout(this.advanceTimer);
      if (!this.session.hasNext()) {
        this.finishSession();
        return;
      }
      this.currentHanzi = this.session.next();
      this.cardNumber = this.session.number;
      this.cardKey++;
      this.optionsByMode = {};
      this.answerState = null;
      this.answeredMode = null;
      this.selectedIndex = null;
      this.ensureOptions();
    },
    finishSession() {
      this.finished = true;
      this.summary = {
        score: this.session.score,
        total: this.session.total,
        missed: this.session.missed.slice(),
        results: this.session.results.slice(),
        bestStreak: this.session.bestStreak,
        modeLabel: this.modeLabel,
      };
    },
    practiceMissed() {
      if (!this.summary.missed.length) return;
      this.startSession(this.summary.missed);
      this.scrollToTop();
    },
    newSession() {
      this.startSession(hanziData, SESSION_LENGTH);
      this.scrollToTop();
    },
    // The summary can be scrolled down (e.g. to its buttons on a phone);
    // a new session starts at the top, with the card in view.
    scrollToTop() {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    },
    ensureOptions() {
      if (this.optionsByMode[this.mode]) return;
      this.optionsByMode[this.mode] = buildOptions(
        this.session.current,
        hanziData,
        this.mode
      );
    },
    select(index) {
      if (this.finished || this.answerState || !this.options[index]) return;
      const correct = this.options[index].correct;
      this.selectedIndex = index;
      this.answeredMode = this.mode;
      this.answerState = correct ? "correct" : "wrong";
      this.session.record(correct);
      // Say the character after every answer, right or wrong.
      speak(this.session.current.hanzi);
      if (correct) {
        this.advanceTimer = setTimeout(this.nextCard, CORRECT_DELAY_MS);
      }
    },
    next() {
      if (this.answerState === "wrong") this.nextCard();
    },
    // Summary shortcuts: Enter = practise the missed ones, N = new session.
    // Enter on a focused button/link (e.g. a review card) keeps its own
    // meaning; preventDefault stops it also "clicking" a focused button.
    onSummaryKeydown(event) {
      if (event.key === "Enter") {
        const target = event.target;
        if (target instanceof Element && target.closest("button, a")) return;
        if (!this.summary.missed.length) return;
        event.preventDefault();
        this.practiceMissed();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        this.newSession();
      }
    },
    onKeydown(event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
        return;
      if (this.finished) {
        this.onSummaryKeydown(event);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        if (this.answerState === "wrong") {
          event.preventDefault();
          this.next();
        }
        return;
      }
      if (/^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1;
        if (index < this.options.length) {
          event.preventDefault();
          this.select(index);
        }
      }
    },
  },
};
</script>

<template>
  <main>
    <!-- Mobile: one column (progress, card, panel with tabs and answers).
         Desktop (>= 1024px): a grid with progress + card on the left and
         the mode tabs and answers on the right. -->
    <!-- Page heading for screen readers and search engines; the card and
         tabs already show the mode visually. -->
    <h1 class="visually-hidden">{{ modeLabel }} quiz – Hànzì</h1>
    <div class="quiz-layout" :class="{ 'is-finished': finished }">
      <template v-if="!finished">
        <section class="progress">
          <div class="progress-label">
            <span class="progress-text-long"
              >Card {{ cardNumber }} of {{ cardTotal }}</span
            >
            <span class="progress-text-short"
              >{{ cardNumber }} / {{ cardTotal }}</span
            >
          </div>
          <div
            class="progress-track"
            role="progressbar"
            aria-label="Session progress"
            :aria-valuenow="Math.round(progressPercent)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="progress-fill"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </section>

        <hanziComp
          :entry="currentHanzi"
          :mode="mode"
          :cardKey="cardKey"
          :reveal="answerState === 'wrong'"
          :correct="answerState === 'correct'"
        />
      </template>

      <section class="interaction-container" :class="{ finished }">
        <ModeTabs v-if="!finished" panelId="quiz-answers" />
        <SessionSummary
          v-if="finished"
          :score="summary.score"
          :total="summary.total"
          :missed="summary.missed"
          :results="summary.results"
          :bestStreak="summary.bestStreak"
          :modeLabel="summary.modeLabel"
          @practiceMissed="practiceMissed"
          @newSession="newSession"
        />
        <div
          v-else
          id="quiz-answers"
          role="tabpanel"
          :aria-labelledby="`mode-tab-${mode}`"
        >
          <RouterView
            :options="options"
            :mode="mode"
            :selectedIndex="shownSelectedIndex"
            :answerState="answerState"
            @select="select"
            @next="next"
          />
        </div>
      </section>
    </div>
  </main>
</template>
