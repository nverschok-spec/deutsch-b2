import { useEffect, useState } from 'react';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

// DailyB2Briefing — верхняя карточка дашборда (см. макет): фокус дня —
// Nomen-Verb-Verbindung, с примером-предложением, перевод на русский
// открывается по клику (не занимает место, пока не нужен).
export default function DailyB2Briefing() {
  const briefing = useGermanStore((s) => s.briefing);
  const setBriefing = useGermanStore((s) => s.briefing.setBriefing);
  const markPhraseLearned = useGermanStore((s) => s.briefing.markPhraseLearned);
  const [status, setStatus] = useState('idle');
  const [showTranslation, setShowTranslation] = useState(false);
  const t = useT();

  useEffect(() => {
    if (!briefing.isFresh()) loadBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBriefing() {
    setStatus('loading');
    try {
      const data = await askClaude('dailyBriefing', {});
      setBriefing(data);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  const nv = briefing.data?.nvVerbindung;

  return (
    <Card className="animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{t('briefing.title')}</h2>
        <span className="text-violet-400" aria-hidden="true">✨</span>
      </div>

      {status === 'loading' && (
        <div className="mt-3">
          <Spinner label={t('briefing.loading')} />
        </div>
      )}

      {status === 'error' && (
        <button onClick={loadBriefing} className="mt-3 text-sm text-rose-400 underline">
          {t('briefing.retry')}
        </button>
      )}

      {nv && (
        <>
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">{t('briefing.nvOfDay')}</p>
          <p className="term-glow text-2xl mt-1">{nv.phrase}</p>

          <button
            onClick={() => {
              setShowTranslation((v) => !v);
              markPhraseLearned(nv.phrase);
            }}
            className="mt-3 w-full text-left rounded-2xl bg-surface-raised/60 border border-surface-border px-3 py-2.5"
          >
            <p className="text-sm text-slate-200">{nv.example}</p>
            {showTranslation ? (
              <p className="text-sm text-slate-400 mt-1 animate-fade-in">{nv.meaningRu}</p>
            ) : (
              <p className="text-xs text-violet-400 mt-1">{t('briefing.showTranslation')}</p>
            )}
          </button>
        </>
      )}
    </Card>
  );
}
