import { useEffect, useRef, useState } from 'react';

// Тонкая обёртка над Web Speech API (SpeechRecognition). Живёт как хук,
// а не внутри UmschulungSimulator, потому что распознавание речи —
// потенциально нужно и в других местах (например, устный ответ в
// SmartGrammarLab в будущем) — логика должна быть переиспользуемой.
export function useSpeechRecognition({ lang = 'de-DE', onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognitionImpl =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const isSupported = Boolean(SpeechRecognitionImpl);

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      setTranscript(final || interim);
      if (final) onResult?.(final);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, isSupported]);

  function start() {
    if (!recognitionRef.current) return;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  return { isListening, transcript, start, stop, isSupported };
}
