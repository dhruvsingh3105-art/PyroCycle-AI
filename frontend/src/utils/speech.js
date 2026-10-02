/**
 * Web Speech API wrapper for informal waste worker accessibility.
 * Supports English (en-IN), Hindi (hi-IN), Bengali (bn-IN), Tamil (ta-IN), Telugu (te-IN).
 */

const LANG_LOCALE_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
};

let activeUtterance = null;
let isSpeakingCallback = null;

export function registerSpeechStateListener(callback) {
  isSpeakingCallback = callback;
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakText(text, lang = "en", onEnd = null) {
  if (!isSpeechSupported() || !text) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  const targetLocale = LANG_LOCALE_MAP[lang] || "en-IN";
  utterance.lang = targetLocale;
  utterance.rate = 0.92; // Slightly paced for informal worker clarity
  utterance.pitch = 1.0;

  // Select suitable regional voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang)) ||
      voices.find((v) => v.lang.toLowerCase().includes("in")) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    if (isSpeakingCallback) isSpeakingCallback(true);
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (isSpeakingCallback) isSpeakingCallback(false);
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    activeUtterance = null;
    if (isSpeakingCallback) isSpeakingCallback(false);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    if (isSpeakingCallback) isSpeakingCallback(false);
  }
}
