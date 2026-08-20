import { useEffect, useRef, useState } from 'react';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { speak } from '../../utils/tts.js';
import { useT } from '../../utils/i18n.js';

const SCENARIO_KEYS = {
  interview: 'scenario.interview',
  colleague: 'scenario.colleague',
  jobcenter: 'scenario.jobcenter',
  professional: 'scenario.professional',
};

// VoiceInputBar — фиксированная нижняя панель на ВСЁ приложение (не только
// на одном экране, как раньше), т.к. в макете голосовой ввод виден на любом
// скролл-положении дашборда. Логика диалога (UmschulungSimulator) живёт тут
// же — отдельного полноэкранного чата в этой версии дизайна нет, последняя
// реплика ИИ показывается прямо над полем ввода.
export default function VoiceInputBar() {
  const settings = useGermanStore((s) => s.settings);
  const setDialogueScenario = useGermanStore((s) => s.settings.setDialogueScenario);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const addConversationSeconds = useGermanStore((s) => s.progress.addConversationSeconds);

  const [text, setText] = useState('');
  const [lastReply, setLastReply] = useState(null); // { text, correction, hint }
  const [status, setStatus] = useState('idle');
  const t = useT();

  const { isListening, transcript, start, stop, isSupported } = useSpeechRecognition({
    lang: settings.voiceLang,
    onResult: (finalText) => handleTurn(finalText),
  });

  // Реальная длительность записи (не оценка) — считаем секунды между
  // включением и выключением микрофона и складываем в progress для
  // "Минуты разговора" в MeinB2Fortschritt.
  const listenStartedAt = useRef(null);
  useEffect(() => {
    if (isListening) {
      listenStartedAt.current = Date.now();
    } else if (listenStartedAt.current) {
      const elapsed = Math.round((Date.now() - listenStartedAt.current) / 1000);
      if (elapsed > 0) addConversationSeconds(elapsed);
      listenStartedAt.current = null;
    }
  }, [isListening, addConversationSeconds]);

  async function handleTurn(userText) {
    if (!userText.trim()) return;
    setText('');
    setStatus('loading');
    try {
      const data = await askClaude('dialogueTurn', {
        scenario: settings.dialogueScenario,
        difficulty: settings.difficulty,
        userTurn: userText,
      });
      setLastReply(data);
      if (settings.voiceEnabled) speak(data.reply, { lang: settings.voiceLang, rate: settings.ttsRate });
      addXp(3, 'simulator');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  return (
    <div className="floating-input-bar">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{t('voicebar.title')}</p>
        <select
          value={settings.dialogueScenario}
          onChange={(e) => setDialogueScenario(e.target.value)}
          className="bg-transparent text-xs text-violet-400 outline-none"
        >
          {Object.entries(SCENARIO_KEYS).map(([key, labelKey]) => (
            <option key={key} value={key} className="bg-surface text-slate-100">
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && (
        <div className="mt-2">
          <Spinner label={t('voicebar.thinking')} />
        </div>
      )}
      {status === 'error' && <p className="mt-2 text-xs text-rose-400">{t('voicebar.error')}</p>}
      {lastReply && status === 'idle' && (
        <div className="mt-2 rounded-2xl bg-surface-raised/60 px-3 py-2 animate-fade-in">
          <p className="text-sm text-slate-200">{lastReply.text}</p>
          {lastReply.correction && <p className="text-xs text-amber-400 mt-1">✏️ {lastReply.correction}</p>}
          {lastReply.hint && <p className="text-xs text-slate-400 mt-1">💡 {lastReply.hint}</p>}
        </div>
      )}

      <div className="flex items-center gap-2 py-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTurn(text)}
          placeholder={t('voicebar.placeholder')}
          className="flex-1 rounded-full bg-surface-raised/70 border border-surface-border px-4 py-3
            text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40"
        />
        <button
          onClick={isListening ? stop : start}
          disabled={!isSupported}
          aria-label="Tap to Speak"
          className={`h-12 px-4 rounded-full flex items-center gap-2 shrink-0 text-white
            ${isListening ? 'bg-rose-500 shadow-glow-rose animate-pulse-slow' : 'bg-violet-gradient shadow-glow-violet'}
            disabled:opacity-40`}
        >
          <MicIcon />
          <SoundWaveIcon active={isListening} />
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-500 -mt-1 pb-1">
        {!isSupported
          ? t('voicebar.notSupported')
          : isListening
            ? transcript || t('voicebar.listening')
            : t('voicebar.tapToSpeak')}
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2Z" />
    </svg>
  );
}

function SoundWaveIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="3" y2="12" className={active ? 'animate-pulse-slow' : ''} />
      <line x1="8" y1="9" x2="8" y2="15" />
      <line x1="13" y1="6" x2="13" y2="18" />
      <line x1="18" y1="9" x2="18" y2="15" />
      <line x1="21" y1="11" x2="21" y2="13" />
    </svg>
  );
}
