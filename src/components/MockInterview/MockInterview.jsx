import { useState } from 'react';
import SparkleIcon from '../common/SparkleIcon.jsx';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { PrimaryButton, SecondaryButton } from '../common/Button.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

const MIN_TURNS_TO_FINISH = 5;

// Полноценное мок-собеседование — не одна реплика (как в VoiceInputBar), а
// сессия на MIN_TURNS_TO_FINISH+ реплик с финальным AI-разбором
// (interviewFeedback в api/claude.js): сильные стороны + что подтянуть перед
// реальным собеседованием. Сценарий всегда 'interview', вне зависимости от
// settings.dialogueScenario — это специально фокусированная тренировка.
export default function MockInterview({ onClose }) {
  const t = useT();
  const settings = useGermanStore((s) => s.settings);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const recordTopic = useGermanStore((s) => s.weakSpots.recordTopic);

  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', text, correction? }
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('idle');

  const userTurns = messages.filter((m) => m.role === 'user').length;

  async function handleSend() {
    if (!text.trim()) return;
    const userText = text.trim();
    setText('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setStatus('loading');
    try {
      const data = await askClaude('dialogueTurn', {
        scenario: 'interview',
        difficulty: settings.difficulty,
        history: messages.slice(-8),
        userTurn: userText,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply, correction: data.correction }]);
      if (data.correction) recordTopic(data.correctionTopic);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function handleFinish() {
    setFeedbackStatus('loading');
    try {
      const data = await askClaude('interviewFeedback', { history: messages });
      setFeedback(data);
      addXp(15, 'interview');
      setFeedbackStatus('idle');
    } catch {
      setFeedbackStatus('error');
    }
  }

  if (feedback) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-bg-deep px-4 py-6 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SparkleIcon size={40} />
            <button onClick={onClose} className="text-xs text-slate-500 underline">
              {t('today.close')}
            </button>
          </div>
          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">{t('interview.feedbackTitle')}</h2>
            <p className="text-sm text-slate-300">{feedback.summary}</p>
            {feedback.strengths?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{t('interview.strengths')}</p>
                <ul className="flex flex-col gap-1">
                  {feedback.strengths.map((s) => (
                    <li key={s} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-violet-400">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.improvements?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{t('interview.improvements')}</p>
                <ul className="flex flex-col gap-1">
                  {feedback.improvements.map((s) => (
                    <li key={s} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-amber-400">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          <PrimaryButton onClick={onClose}>{t('today.close')}</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-deep px-4 py-6">
      <div className="mx-auto w-full max-w-sm flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <SparkleIcon size={40} />
          <p className="text-xs text-slate-500">{t('interview.title')}</p>
          <button onClick={onClose} className="text-xs text-slate-500 underline">
            {t('today.close')}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-2">
          {messages.length === 0 && <p className="text-sm text-slate-400">{t('interview.intro')}</p>}
          {messages.map((m, i) => (
            <Card key={i} className={`animate-fade-in ${m.role === 'user' ? 'ml-8' : 'mr-8'}`}>
              <p className="text-sm">{m.text}</p>
              {m.correction && <p className="text-xs text-amber-400 mt-2">✏️ {m.correction}</p>}
            </Card>
          ))}
          {status === 'loading' && <Spinner label={t('voicebar.thinking')} />}
          {status === 'error' && <p className="text-sm text-rose-400">{t('voicebar.error')}</p>}
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          {userTurns >= MIN_TURNS_TO_FINISH && (
            <SecondaryButton onClick={handleFinish} disabled={feedbackStatus === 'loading'} className="w-full text-sm">
              {feedbackStatus === 'loading' ? <Spinner label={t('interview.finishing')} /> : t('interview.finish')}
            </SecondaryButton>
          )}
          {feedbackStatus === 'error' && <p className="text-xs text-rose-400 text-center">{t('interview.feedbackError')}</p>}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('today.step3.placeholder')}
              className="flex-1 rounded-full bg-surface-raised/70 border border-surface-border px-4 py-3
                text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40"
            />
            <PrimaryButton onClick={handleSend} disabled={status === 'loading' || !text.trim()} className="rounded-full px-5">
              {t('today.step3.send')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
