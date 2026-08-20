import { useState } from 'react';
import Card from '../common/Card.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude, ClaudeApiError } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

// B2SentenceUpgrader — пользователь вводит простое предложение → ИИ
// переписывает на B2. Сверху итог одной строкой (как в макете), полный
// разбор изменений — по клику, чтобы не перегружать карточку.
export default function B2SentenceUpgrader() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // { upgraded, changes[] }
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [showDetails, setShowDetails] = useState(false);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const recordTopic = useGermanStore((s) => s.weakSpots.recordTopic);
  const t = useT();

  async function handleUpgrade() {
    if (!input.trim()) return;
    setStatus('loading');
    setResult(null);
    setShowDetails(false);
    try {
      const data = await askClaude('upgradeSentence', { sentence: input.trim() });
      setResult(data);
      data.changes?.forEach((change) => recordTopic(change.topic));
      setStatus('idle');
      addXp(5, 'upgrader');
    } catch (err) {
      setStatus('error');
      console.error(err instanceof ClaudeApiError ? err.message : err);
    }
  }

  return (
    <Card className="animate-slide-up">
      <h2 className="text-lg font-bold text-white mb-3">{t('upgrader.title')}</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleUpgrade()}
        placeholder="Er sagte mir, dass er krank ist."
        className="w-full rounded-2xl bg-surface-raised/60 border border-surface-border px-4 py-3
          text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40"
      />

      {result && (
        <div className="mt-3 animate-fade-in">
          <p className="term-glow text-lg">{result.upgraded}</p>
          {result.changes?.[0] && (
            <p className="text-sm text-slate-400 mt-1">
              <span className="text-violet-400 font-semibold">B2</span> ({result.changes[0].explanationRu})
            </p>
          )}
        </div>
      )}

      {status === 'error' && <p className="text-sm text-rose-400 mt-2">{t('upgrader.error')}</p>}

      <PrimaryButton onClick={handleUpgrade} disabled={status === 'loading'} className="mt-4 w-full">
        {status === 'loading' ? <Spinner label={t('upgrader.analyzing')} /> : t('upgrader.analyze')}
      </PrimaryButton>

      {result?.changes?.length > 0 && (
        <>
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="mt-3 text-xs text-slate-400 underline"
          >
            {showDetails ? t('upgrader.hideDetails') : t('upgrader.showDetails')}
          </button>
          {showDetails && (
            <div className="mt-3 flex flex-col gap-3 animate-fade-in">
              {result.changes.map((change, i) => (
                <div key={i} className="border-t border-surface-border pt-3">
                  <p className="text-sm text-slate-500 line-through">{change.original}</p>
                  <p className="text-sm text-violet-300">{change.improved}</p>
                  <p className="text-xs text-slate-400 mt-1">{change.explanationRu}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
