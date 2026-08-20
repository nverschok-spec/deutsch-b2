import { useEffect, useState } from 'react';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';
import { mondayOf } from '../../store/slices/createWeeklyDigestSlice.js';

// Раз в неделю (не при каждом заходе — см. weeklyDigest.isFresh()) короткий
// AI-дайджест: сколько сделано за неделю + куда фокусироваться дальше.
// Требует хоть какой-то активности (иначе AI просто придумывает воду).
export default function WeeklyDigestCard() {
  const t = useT();
  const weeklyDigest = useGermanStore((s) => s.weeklyDigest);
  const setDigest = useGermanStore((s) => s.weeklyDigest.setDigest);
  const history = useGermanStore((s) => s.progress.history);
  const vocabCount = useGermanStore((s) => s.vocab.cards.length);
  const topWeakSpots = useGermanStore((s) => s.weakSpots.topWeakSpots(3));
  const [status, setStatus] = useState('idle');

  const weekStart = mondayOf(new Date());
  const thisWeekHistory = history.filter((h) => h.date >= weekStart);
  const hasActivity = thisWeekHistory.length > 0;

  useEffect(() => {
    if (weeklyDigest.isFresh() || !hasActivity) return;
    setStatus('loading');
    const stats = {
      xpThisWeek: thisWeekHistory.reduce((sum, h) => sum + h.xp, 0),
      daysActiveThisWeek: new Set(thisWeekHistory.map((h) => h.date)).size,
      totalWords: vocabCount,
    };
    askClaude('weeklyDigest', { stats, weakSpots: topWeakSpots })
      .then((data) => {
        setDigest(data);
        setStatus('idle');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, hasActivity]);

  if (!hasActivity && !weeklyDigest.data) return null;

  return (
    <Card className="animate-slide-up">
      <h2 className="text-sm font-bold text-white mb-2">{t('weekly.title')}</h2>
      {status === 'loading' && <Spinner label={t('weekly.loading')} />}
      {status === 'error' && <p className="text-xs text-rose-400">{t('weekly.error')}</p>}
      {weeklyDigest.data && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-300">{weeklyDigest.data.summary}</p>
          <p className="text-xs text-violet-400">→ {weeklyDigest.data.nextFocus}</p>
        </div>
      )}
    </Card>
  );
}
