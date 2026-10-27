// Pinyin helpers: tone parsing and "near-identical" syllables.

const TONE_MARKS = {
  a: "āáǎà",
  e: "ēéěè",
  i: "īíǐì",
  o: "ōóǒò",
  u: "ūúǔù",
  ü: "ǖǘǚǜ",
};

const MARKED = {};
for (const [vowel, marks] of Object.entries(TONE_MARKS)) {
  [...marks].forEach((mark, i) => (MARKED[mark] = [vowel, i + 1]));
}

// "rén" -> { base: "ren", tone: 2 }. Tone 5 = neutral / unmarked.
export function parsePinyin(pinyin) {
  let base = "";
  let tone = 5;
  for (const ch of pinyin.trim().normalize("NFC")) {
    if (MARKED[ch]) {
      base += MARKED[ch][0];
      tone = MARKED[ch][1];
    } else {
      base += ch;
    }
  }
  return { base, tone };
}

// Collapses the differences learners can't yet hear apart:
// zh/z, ch/c, sh/s and a final -ng/-n. "zhang" and "zan" both become "zan".
function looseSyllable(base) {
  return base.replace(/^([zcs])h/, "$1").replace(/ng$/, "n");
}

// True if two pinyin syllables (with or without tone marks) are the same
// or near-identical: same base, -n/-ng, or z/zh, c/ch, s/sh.
export function soundsAlike(a, b) {
  return (
    looseSyllable(parsePinyin(a).base) === looseSyllable(parsePinyin(b).base)
  );
}
