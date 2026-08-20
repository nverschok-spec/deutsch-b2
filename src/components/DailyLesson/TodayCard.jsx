import Card from '../common/Card.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';
import { buildPlan } from '../../utils/plan.js';

// Верхняя карточка дашборда — единственная точка входа в пошаговый урок дня
// (DailyLesson.jsx). Строится из плана онбординга (utils/plan.js), поэтому
// план из "показали один раз и забыли" становится тем, что реально двигает
// пользователя изо дня в день.
export default function TodayCard({ onStart }) {
  const t = useT();
  const settings = useGermanStore((s) => s.settings);
  const isCompletedToday = useGermanStore((s) => s.lesson.isCompletedToday());
  const plan = settings.level ? buildPlan({ level: settings.level, fachbereich: settings.fachbereich }) : null;

  return (
    <Card className="animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-white">{t('today.title')}</h2>
        {plan && (
          <span className="text-xs text-violet-400">
            {plan.dailyTargetMinutes} {t('onboarding.planMinutes')}
          </span>
        )}
      </div>

      {plan && (
        <p className="text-sm text-slate-400 mb-3">
          {t('today.focus')}: {plan.focusAreas[0]}
        </p>
      )}

      {isCompletedToday ? (
        <div className="rounded-2xl bg-surface-raised/50 px-4 py-3">
          <p className="text-sm font-semibold text-violet-300">{t('today.done')} ✓</p>
          <p className="text-xs text-slate-500 mt-1">{t('today.doneHint')}</p>
        </div>
      ) : (
        <PrimaryButton onClick={onStart} className="w-full">
          {t('today.start')}
        </PrimaryButton>
      )}
    </Card>
  );
}
