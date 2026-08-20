import { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

const inputClass =
  'w-full rounded-2xl bg-surface-raised/60 border border-surface-border px-4 py-3 ' +
  'text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40';

// Форма установки/смены PIN — используется и в Settings, и (позже) в PinLock
// для смены забытого PIN после успешного секретного вопроса.
export default function PinSetupForm({ onDone, onCancel }) {
  const t = useT();
  const setPin = useGermanStore((s) => s.settings.setPin);
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  async function handleSave() {
    if (!/^\d{4}$/.test(pin)) {
      setError(t('pin.invalid'));
      return;
    }
    if (pin !== confirmPin) {
      setError(t('pin.mismatch'));
      return;
    }
    if (!question.trim() || !answer.trim()) {
      setError(t('pin.invalid'));
      return;
    }
    await setPin(pin, question.trim(), answer);
    onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={pin}
        onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
        inputMode="numeric"
        placeholder={t('pin.newPin')}
        className={inputClass}
      />
      <input
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        inputMode="numeric"
        placeholder={t('pin.confirmPin')}
        className={inputClass}
      />
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t('pin.recoveryQuestion')}
        className={inputClass}
      />
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t('pin.recoveryAnswer')}
        className={inputClass}
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex gap-2">
        <PrimaryButton onClick={handleSave} className="flex-1 text-sm">
          {t('settings.save')}
        </PrimaryButton>
        <SecondaryButton onClick={onCancel} className="flex-1 text-sm">
          {t('settings.cancel')}
        </SecondaryButton>
      </div>
    </div>
  );
}
