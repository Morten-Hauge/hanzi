import { ref } from "vue";

// Pronunciation via the Web Speech API. `chineseVoiceAvailable` is reactive,
// so components can hide speaker buttons when there's no Mandarin voice.
export const chineseVoiceAvailable = ref(false);

const supported = typeof window !== "undefined" && "speechSynthesis" in window;
let voice = null;

// Prefer mainland Mandarin (zh-CN), then other Mandarin voices. zh-HK is
// skipped on purpose: it's Cantonese.
const PREFERRED_LANGS = [/^zh-cn/, /^cmn/, /^zh-(tw|sg)/, /^zh$/];

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  const lang = (v) => v.lang.replace("_", "-").toLowerCase();
  voice = null;
  for (const pattern of PREFERRED_LANGS) {
    voice = voices.find((v) => pattern.test(lang(v))) || null;
    if (voice) break;
  }
  chineseVoiceAvailable.value = voice !== null;
}

if (supported) {
  pickVoice();
  // Most browsers load voices asynchronously.
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

export function speak(text) {
  if (!voice) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (supported) window.speechSynthesis.cancel();
}
