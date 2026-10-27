import { shuffle } from "./random";

// One practice session: `length` different characters in random order,
// each shown once. Misses are collected for "Practice missed ones".
export class Session {
  constructor(items, length = items.length) {
    this.queue = shuffle(items).slice(0, length);
    this.total = this.queue.length;
    this.number = 0; // cards shown so far
    this.missed = []; // in the order they were missed
    this.results = []; // true/false per card, in session order
    this.current = null;
  }

  hasNext() {
    return this.queue.length > 0;
  }

  next() {
    this.current = this.queue.shift();
    this.number++;
    return this.current;
  }

  // Records the answer to the current card.
  record(correct) {
    this.results.push(correct);
    if (!correct) this.missed.push(this.current);
  }

  get score() {
    return this.total - this.missed.length;
  }

  // Longest run of correct first-try answers.
  get bestStreak() {
    let best = 0;
    let run = 0;
    for (const correct of this.results) {
      run = correct ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  }
}
