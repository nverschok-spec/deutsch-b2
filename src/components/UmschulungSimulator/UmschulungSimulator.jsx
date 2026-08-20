import { useState } from 'react';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { speak } from '../../utils/tts.js';

const SCENARIOS = {
  interview: 'Собеседование на Umschulung',
  colleague: 'Разговор с коллегой',
  jobcenter: 'Общение в Jobcenter',
  professional: 'Профессиональная тематика',
};

// Модуль 2: голосовой диалоговый тренажёр. Web Speech API (см.
// hooks/useSpeechRecognition.js) даёт распознанный текст → уходит в
// /api/claude (task: dialogueTurn) → ответ озвучивается через utils/tts.js
// и может содержать мгновенное исправление ошибки пользователя.
export default function UmschulungSimulator() {
  const settings = useGermanStore((s) => s.settings);
  const setDialogueScenario = useGermanStore((s) => s.settings.setDialogueScenario);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', text, correction? }
  const [status, setStatus] = useState('idle');

  const { isListening, transcript, start, stop, isSupported } = useSpeechRecognition({
    lang: settings.voiceLang,
    onResult: (finalText) => handleUserTurn(finalText),
  });

  async function handleUserTurn(text) {
    if (!text.trim()) return;
    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setStatus('loading');
    try {
      const data = await askClaude('dialogueTurn', {
        scenario: settings.dialogueScenario,
        difficulty: settings.difficulty,
        history: nextMessages.slice(-8), // короткое окно контекста — Haiku недорогой, но не безлимитный
        userTurn: text,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply, correction: data.correction, hint: data.hint }]);
      if (settings.voiceEnabled) speak(data.reply, { lang: settings.voiceLang, rate: settings.ttsRate });
      addXp(3, 'simulator');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold">Umschulung Simulator</h1>
        <select
          value={settings.dialogueScenario}
          onChange={(e) => setDialogueScenario(e.target.value)}
          className="mt-2 bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm w-full"
        >
          {Object.entries(SCENARIOS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </header>

      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <Card key={i} className={`animate-fade-in ${m.role === 'user' ? 'ml-8' : 'mr-8'}`}>
            <p className="text-sm">{m.text}</p>
            {m.correction && <p className="text-xs text-amber-300 mt-2">✏️ {m.correction}</p>}
            {m.hint && <p className="text-xs text-slate-400 mt-1">💡 {m.hint}</p>}
          </Card>
        ))}
        {status === 'loading' && <Spinner label="ИИ отвечает…" />}
        {status === 'error' && <p className="text-sm text-rose-400">Ошибка соединения. Попробуй ещё раз.</p>}
      </div>

      {!isSupported && (
        <p className="text-sm text-amber-300">Голосовой ввод не поддерживается в этом браузере — используй Chrome.</p>
      )}

      <div className="floating-input-bar">
        <div className="flex items-center gap-3 pb-2">
          <button
            onClick={isListening ? stop : start}
            disabled={!isSupported}
            className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0
              ${isListening ? 'bg-rose-500 shadow-glow-rose animate-pulse-slow' : 'bg-mint-gradient shadow-glow-mint'}`}
          >
            🎤
          </button>
          <p className="text-sm text-slate-300 flex-1">
            {isListening ? transcript || 'Слушаю…' : 'Нажми и говори по-немецки'}
          </p>
        </div>
      </div>
    </div>
  );
}
