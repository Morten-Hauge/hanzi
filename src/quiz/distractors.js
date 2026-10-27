import { OPTION_COUNT } from "./config";
import { soundsAlike } from "./pinyin";
import { shuffle } from "./random";

let nextOptionId = 0;

// Builds the answer options for one card: [{ id, label, correct }], exactly
// one correct, no duplicate labels.
//
// `mastery` is optional: a function hanzi -> level (lower = weaker). When
// given, Pinyin mode prefers distractors from weaker characters.
export function buildOptions(
  entry,
  data,
  mode,
  { count = OPTION_COUNT, mastery } = {}
) {
  let answer, distractors;
  if (mode === "pinyin") {
    answer = entry.pinyin.trim();
    distractors = pinyinDistractors(entry, data, answer, count - 1, mastery);
  } else {
    // "english" (character -> meaning) or "character" (meaning -> character)
    const field = mode === "character" ? "hanzi" : "english";
    answer = entry[field];
    distractors = lookAlikeDistractors(entry, data, field, answer, count - 1);
  }

  return shuffle([
    { label: answer, correct: true },
    ...distractors.map((label) => ({ label, correct: false })),
  ]).map((option) => ({ ...option, id: nextOptionId++ }));
}

// Takes labels from the tiers in order, skipping duplicates and the answer.
function pickUnique(tiers, answer, needed) {
  const seen = new Set([answer]);
  const picked = [];
  for (const tier of tiers) {
    for (const label of tier) {
      if (picked.length === needed) return picked;
      if (!seen.has(label)) {
        seen.add(label);
        picked.push(label);
      }
    }
  }
  return picked;
}

// Pinyin: readings of other characters in the set, none of which sound
// alike (same base, -n/-ng, z/zh, c/ch, s/sh) to the answer or each other.
function pinyinDistractors(entry, data, answer, needed, mastery) {
  let candidates = shuffle(data.filter((item) => item.hanzi !== entry.hanzi));
  if (mastery) {
    // Stable sort keeps the shuffle as the tie-breaker within a level.
    candidates = candidates.sort((a, b) => mastery(a.hanzi) - mastery(b.hanzi));
  }

  const chosen = [answer];
  for (const item of candidates) {
    if (chosen.length - 1 === needed) break;
    const label = item.pinyin.trim();
    if (!chosen.some((other) => soundsAlike(other, label))) chosen.push(label);
  }
  return chosen.slice(1);
}

// Visually similar characters first, then random. `field` picks what the
// option shows: their meaning ("english") or the character itself ("hanzi").
function lookAlikeDistractors(entry, data, field, answer, needed) {
  const similar = shuffle(
    (entry.similar || [])
      .map((hanzi) => data.find((item) => item.hanzi === hanzi))
      .filter(Boolean)
  );
  const others = shuffle(data.filter((item) => item.hanzi !== entry.hanzi));
  return pickUnique(
    [similar.map((item) => item[field]), others.map((item) => item[field])],
    answer,
    needed
  );
}
