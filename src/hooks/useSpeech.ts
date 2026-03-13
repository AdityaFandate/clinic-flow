import { useState, useCallback, useRef } from 'react';

/**
 * Map language names to BCP-47 locale codes for speech recognition and TTS.
 */
const LANG_MAP: Record<string, string> = {
  english: 'en-IN',   // Indian English for medical context
  hindi: 'hi-IN',
  marathi: 'mr-IN',
};

/**
 * Find the best available voice for a language.
 * Prefers female voices and Google/Microsoft high-quality voices when available.
 */
function findBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Filter voices matching the language
  const matching = voices.filter((v) => v.lang.startsWith(langCode.split('-')[0]));
  if (!matching.length) return null;

  // Prefer: 1) Google voices  2) Microsoft voices  3) female voices  4) any match
  const ranked = [...matching].sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) => {
      let s = 0;
      if (v.name.toLowerCase().includes('google')) s += 10;
      if (v.name.toLowerCase().includes('microsoft')) s += 5;
      if (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')) s += 2;
      if (v.lang === langCode) s += 1; // exact locale match
      return s;
    };
    return score(b) - score(a);
  });

  return ranked[0];
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  /**
   * Start speech recognition.
   * @param onResult callback called with the recognized text
   * @param language optional language hint (english / hindi / marathi)
   */
  const startListening = useCallback((onResult?: (text: string) => void, language?: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("[Speech] Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set the recognition language based on the user's selected language
    const langCode = language ? LANG_MAP[language.toLowerCase()] : undefined;
    if (langCode) {
      recognition.lang = langCode;
    }
    // If no language set, the browser uses its default — which often auto-detects

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("[Speech] Recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (onResult) onResult(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /**
   * Speak text aloud with natural NLP-quality pacing.
   * Selects the best available voice for the detected language.
   */
  const speak = useCallback((text: string, language: string = 'english') => {
    if (!window.speechSynthesis) return;

    // Stop any current speaking
    window.speechSynthesis.cancel();

    // Clean the text for better TTS output
    const cleanedText = text
      .replace(/[*_#`]/g, '')          // remove markdown artifacts
      .replace(/\s{2,}/g, ' ')         // collapse multiple spaces
      .trim();

    if (!cleanedText) return;

    const langCode = LANG_MAP[language.toLowerCase()] || 'en-IN';

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = langCode;

    // Natural speech pacing — slightly slower for clarity, warm pitch
    utterance.rate = 0.95;   // slightly slower than default for medical context
    utterance.pitch = 1.05;  // slightly higher for a warm, friendly tone
    utterance.volume = 1.0;

    // Select the best voice for the language
    let voice = findBestVoice(langCode);

    // Dynamic fallback: If Marathi (mr-IN) voice is missing, fallback to Hindi (hi-IN)
    // as it uses the same Devanagari script and is significantly better than English.
    if (!voice && language.toLowerCase() === 'marathi') {
      console.warn(`[Speech] Marathi voice missing, falling back to Hindi voice`);
      voice = findBestVoice('hi-IN');
    }

    if (voice) {
      utterance.voice = voice;
      console.log(`[Speech] Using voice: ${voice.name} (${voice.lang})`);
    }

    // Chrome bug workaround: voices may not be loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const retryVoice = findBestVoice(langCode);
        if (retryVoice) utterance.voice = retryVoice;
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { isListening, transcript, startListening, stopListening, speak, setTranscript };
}
