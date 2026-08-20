import { useState } from 'react';
import SparkleIcon from '../common/SparkleIcon.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

const inputClass =
  'w-full text-center text-2xl tracking-[0.5em] rounded-2xl bg-surface-raised/60 border border-surface-border ' +
  'px-4 py-3 text-slate-100 outline-none focus:border-violet-500/40';

// Полноэкранный замок — показывается в App.jsx, когда pinHash задан и
// isUnlocked === false (сбрасывается на каждом холодном старте, см.
// createSettingsSlice.js). "Забыл PIN?" ведёт через секретный вопрос;
// успешный ответ снимает PIN и разблокирует — новый PIN ставится потом
// через Settings (не тут же: как только pinHash становится null, App.jsx
// снимает PinLock с экрана, так что "форма сразу после ответа" недостижима).
export default function PinLock() {
  const t = useT();
  const settings = useGermanStore((s) => s.settings);
  const tryUnlock = useGermanStore((s) => s.settings.tryUnlock);
  const tryRecoverWithAnswer = useGermanStore((s) => s.settings.tryRecoverWithAnswer);

  const [mode, setMode] = useState('pin'); // 'pin' | 'recover'
  const [pin, setPin] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  async function handleUnlock() {
    const ok = await tryUnlock(pin);
    if (!ok) {
      setError(t('pin.wrong'));
      setPin('');
    }
  }

  async function handleRecover() {
    const ok = await tryRecoverWithAnswer(answer);
    if (!ok) setError(t('pin.answerWrong'));
    // при успехе App.jsx сам уберёт PinLock (pinHash обнулился, isUnlocked=true)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-deep px-6">
      <SparkleIcon size={56} />

      {mode === 'pin' && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <p className="text-center text-slate-300">{t('pin.enter')}</p>
          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && pin.length === 4 && handleUnlock()}
            inputMode="numeric"
            autoFocus
            className={inputClass}
          />
          {error && <p className="text-center text-sm text-rose-400">{error}</p>}
          <PrimaryButton onClick={handleUnlock} disabled={pin.length !== 4}>
            {t('pin.unlock')}
          </PrimaryButton>
          <button onClick={() => setMode('recover')} className="text-center text-xs text-slate-500 underline">
            {t('pin.forgot')}
          </button>
        </div>
      )}

      {mode === 'recover' && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <p className="text-center text-slate-300">{settings.recoveryQuestion}</p>
          <input
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleRecover()}
            autoFocus
            placeholder={t('pin.recoveryAnswer')}
            className={inputClass + ' text-base tracking-normal'}
          />
          {error && <p className="text-center text-sm text-rose-400">{error}</p>}
          <PrimaryButton onClick={handleRecover} disabled={!answer.trim()}>
            {t('pin.unlock')}
          </PrimaryButton>
          <button onClick={() => setMode('pin')} className="text-center text-xs text-slate-500 underline">
            {t('pin.back')}
          </button>
        </div>
      )}
    </div>
  );
}
