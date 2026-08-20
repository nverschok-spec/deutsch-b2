import { useState } from 'react';
import SparkleIcon from '../common/SparkleIcon.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

const PIN_LENGTH = 6;

const inputClass =
  'w-full text-center text-2xl tracking-[0.4em] rounded-2xl bg-surface-raised/60 border border-surface-border ' +
  'px-4 py-3 text-slate-100 outline-none focus:border-violet-500/40';

// Полноэкранный замок — показывается в App.jsx, пока isUnlocked === false
// (сбрасывается на каждом холодном старте, см. createSettingsSlice.js).
// Один фиксированный PIN на всё приложение, без формы установки и без
// самостоятельного восстановления: одна неверная попытка блокирует
// дальнейший ввод (pinAttemptLocked, персистится — reload не обходит).
// Это осознанное решение по запросу — приоритет "никто посторонний не
// зайдёт" важнее удобства самостоятельного сброса пароля.
export default function PinLock() {
  const t = useT();
  const tryUnlock = useGermanStore((s) => s.settings.tryUnlock);
  const pinAttemptLocked = useGermanStore((s) => s.settings.pinAttemptLocked);

  const [pin, setPin] = useState('');

  async function handleUnlock() {
    const ok = await tryUnlock(pin);
    if (!ok) setPin('');
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-deep px-6">
      <SparkleIcon size={56} />

      {pinAttemptLocked ? (
        <p className="text-center text-sm text-rose-400 w-full max-w-xs">{t('pin.lockedOut')}</p>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <p className="text-center text-slate-300">{t('pin.enter')}</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
            onKeyDown={(e) => e.key === 'Enter' && pin.length === PIN_LENGTH && handleUnlock()}
            inputMode="numeric"
            autoFocus
            className={inputClass}
          />
          <PrimaryButton onClick={handleUnlock} disabled={pin.length !== PIN_LENGTH}>
            {t('pin.unlock')}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
