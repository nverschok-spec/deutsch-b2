import Card from '../common/Card.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { useT } from '../../utils/i18n.js';

// Входная точка в MockInterview.jsx — отдельная от TodayCard/DailyLesson:
// это не ежедневный ритуал, а тренировка на 5+ реплик с финальным разбором,
// для тех, кто хочет углублённо потренироваться перед реальным собеседованием.
export default function MockInterviewCard({ onStart }) {
  const t = useT();
  return (
    <Card className="animate-slide-up">
      <h2 className="text-lg font-bold text-white mb-1">{t('interview.cardTitle')}</h2>
      <p className="text-sm text-slate-400 mb-3">{t('interview.cardHint')}</p>
      <PrimaryButton onClick={onStart} className="w-full">
        {t('interview.cardStart')}
      </PrimaryButton>
    </Card>
  );
}
