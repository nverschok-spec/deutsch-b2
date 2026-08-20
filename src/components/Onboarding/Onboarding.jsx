import { useState } from 'react';
import SparkleIcon from '../common/SparkleIcon.jsx';
import Card from '../common/Card.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';
import { buildPlan } from '../../utils/plan.js';

const LEVELS = ['A2', 'A2-B1', 'B1', 'B1-B2', 'B2'];

// Онбординг перед первым входом в дашборд: самооценка уровня (без ИИ —
// быстро и бесплатно) + необязательная сфера Umschulung → мгновенный
// правило-based план (см. utils/plan.js), который потом виден в Settings.
export default function Onboarding() {
  const t = useT();
  const completeOnboarding = useGermanStore((s) => s.settings.completeOnboarding);
  const [step, setStep] = useState('level'); // 'level' | 'plan'
  const [level, setLevel] = useState(null);
  const [fachbereich, setFachbereich] = useState('');

  function handleContinue() {
    setStep('plan');
  }

  function handleStart() {
    completeOnboarding({ level, fachbereich });
  }

  const plan = level ? buildPlan({ level, fachbereich }) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-deep px-6 overflow-y-auto py-10">
      <SparkleIcon size={56} />

      {step === 'level' && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <h1 className="text-center text-xl font-bold text-white">{t('onboarding.welcome')}</h1>

          <div>
            <p className="text-sm text-slate-300 mb-2">{t('onboarding.levelQuestion')}</p>
            <div className="flex flex-col gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-medium border transition-colors
                    ${level === lvl ? 'bg-violet-gradient text-white border-transparent' : 'bg-surface-raised/50 text-slate-300 border-surface-border'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-300 mb-2">{t('onboarding.fachbereichQuestion')}</p>
            <input
              value={fachbereich}
              onChange={(e) => setFachbereich(e.target.value)}
              placeholder={t('onboarding.fachbereichPlaceholder')}
              className="w-full rounded-2xl bg-surface-raised/60 border border-surface-border px-4 py-3
                text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40"
            />
          </div>

          <PrimaryButton onClick={handleContinue} disabled={!level}>
            {t('onboarding.continue')}
          </PrimaryButton>
        </div>
      )}

      {step === 'plan' && plan && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <h1 className="text-center text-xl font-bold text-white">{t('onboarding.planTitle')}</h1>
          <Card>
            <ul className="flex flex-col gap-2">
              {plan.focusAreas.map((area) => (
                <li key={area} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-violet-400">•</span>
                  {area}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-3">{plan.dailyTargetMinutes} {t('onboarding.planMinutes')}</p>
          </Card>
          <PrimaryButton onClick={handleStart}>{t('onboarding.start')}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
