import Card from '../common/Card.jsx';
import { SecondaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';
import { buildPlan } from '../../utils/plan.js';

const FOCUS_OPTIONS = ['balanced', 'grammar', 'vocab', 'speaking'];
const STRICTNESS_OPTIONS = ['gentle', 'balanced', 'strict'];
const TONE_OPTIONS = ['friendly', 'professional'];

// Settings — язык интерфейса, профиль обучения (уходит в system-промпты
// api/claude.js), сводка плана из онбординга. PIN тут не настраивается —
// он один фиксированный на всё приложение (см. createSettingsSlice.js).
export default function Settings() {
  const t = useT();
  const settings = useGermanStore((s) => s.settings);
  const setUiLanguage = useGermanStore((s) => s.settings.setUiLanguage);
  const setTeachingProfile = useGermanStore((s) => s.settings.setTeachingProfile);
  const resetOnboarding = useGermanStore((s) => s.settings.resetOnboarding);

  const plan = settings.level ? buildPlan({ level: settings.level, fachbereich: settings.fachbereich }) : null;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold">{t('settings.title')}</h1>
      </header>

      <Card>
        <h2 className="text-sm font-bold text-white mb-3">{t('settings.language')}</h2>
        <div className="flex gap-2">
          <SegButton active={settings.uiLanguage === 'ru'} onClick={() => setUiLanguage('ru')}>
            Русский
          </SegButton>
          <SegButton active={settings.uiLanguage === 'de'} onClick={() => setUiLanguage('de')}>
            Deutsch
          </SegButton>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-white">{t('settings.teachingProfile')}</h2>

        <div>
          <p className="text-xs text-slate-400 mb-2">{t('settings.focus')}</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((opt) => (
              <SegButton
                key={opt}
                active={settings.teachingProfile.focus === opt}
                onClick={() => setTeachingProfile({ focus: opt })}
              >
                {t(`settings.focus.${opt}`)}
              </SegButton>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-2">{t('settings.strictness')}</p>
          <div className="flex flex-wrap gap-2">
            {STRICTNESS_OPTIONS.map((opt) => (
              <SegButton
                key={opt}
                active={settings.teachingProfile.strictness === opt}
                onClick={() => setTeachingProfile({ strictness: opt })}
              >
                {t(`settings.strictness.${opt}`)}
              </SegButton>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-2">{t('settings.tone')}</p>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((opt) => (
              <SegButton
                key={opt}
                active={settings.teachingProfile.tone === opt}
                onClick={() => setTeachingProfile({ tone: opt })}
              >
                {t(`settings.tone.${opt}`)}
              </SegButton>
            ))}
          </div>
        </div>
      </Card>

      {plan && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">{t('settings.myPlan')}</h2>
            <span className="text-xs text-violet-400">{settings.level}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {plan.focusAreas.map((area) => (
              <li key={area} className="text-sm text-slate-300 flex gap-2">
                <span className="text-violet-400">•</span>
                {area}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-2">{plan.dailyTargetMinutes} {t('onboarding.planMinutes')}</p>
          <SecondaryButton onClick={resetOnboarding} className="mt-3 w-full text-sm">
            {t('settings.retakeTest')}
          </SecondaryButton>
        </Card>
      )}
    </div>
  );
}

function SegButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-medium border transition-colors
        ${active ? 'bg-violet-gradient text-white border-transparent' : 'bg-surface-raised/50 text-slate-300 border-surface-border'}`}
    >
      {children}
    </button>
  );
}
