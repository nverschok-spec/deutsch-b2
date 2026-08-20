import Card from '../common/Card.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

// Темы, по которым ИИ чаще всего исправляет пользователя — считается из
// correctionTopic (dialogueTurn) и changes[].topic (upgradeSentence), без
// отдельного AI-вызова (см. store/slices/createWeakSpotsSlice.js).
export default function WeakSpotsCard() {
  const t = useT();
  const topSpots = useGermanStore((s) => s.weakSpots.topWeakSpots(3));

  if (topSpots.length === 0) return null;

  return (
    <Card className="animate-slide-up">
      <h2 className="text-sm font-bold text-white mb-1">{t('weakspots.title')}</h2>
      <p className="text-xs text-slate-400 mb-3">{t('weakspots.hint')}</p>
      <div className="flex flex-wrap gap-2">
        {topSpots.map(({ topic, count }) => (
          <span key={topic} className="badge-medium">
            {topic} · {count}
          </span>
        ))}
      </div>
    </Card>
  );
}
