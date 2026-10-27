// The quiz modes, in display order. Used by the mode tabs (ModeTabs).
export const QUIZ_MODES = [
  { mode: "pinyin", to: "/quiz", label: "Pinyin", hint: "字 → pīnyīn" },
  {
    mode: "english",
    to: "/quiz/english",
    label: "English",
    hint: "字 → english",
  },
  {
    mode: "character",
    to: "/quiz/character",
    label: "Character",
    hint: "english → 字",
  },
];

// Route name -> mode ("pinyin" for the quiz's default route).
export function modeFromRoute(route) {
  return ["english", "character"].includes(route.name) ? route.name : "pinyin";
}
