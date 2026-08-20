import { useState } from 'react';
import Card from '../common/Card.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useT } from '../../utils/i18n.js';

// Модуль 3: разбор произвольной фразы/текста — Satzklammer, Rektion
// глаголов, падежи. Ответ ИИ рендерится как есть (структура из
// api/claude.js → PROMPTS.grammarAnalysis); точную визуализацию рамки
// (глагол слева/справа) добавим отдельным компонентом позже.
export default function SmartGrammarLab() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const t = useT();

  async function handleAnalyze() {
    if (!input.trim()) return;
    setStatus('loading');
    setResult(null);
    try {
      const data = await askClaude('grammarAnalysis', { text: input.trim() });
      setResult(data);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold">{t('grammar.title')}</h1>
        <p className="text-sm text-slate-400">{t('grammar.subtitle')}</p>
      </header>

      <Card>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Obwohl er sich sehr bemüht hat, konnte er die Prüfung nicht bestehen."
          rows={3}
          className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 resize-none outline-none"
        />
        <PrimaryButton onClick={handleAnalyze} disabled={status === 'loading'} className="mt-3 w-full">
          {status === 'loading' ? <Spinner label={t('grammar.analyzing')} /> : t('grammar.analyze')}
        </PrimaryButton>
      </Card>

      {status === 'error' && (
        <p className="text-sm text-rose-400">{t('grammar.error')}</p>
      )}

      {result && (
        <Card className="animate-slide-up flex flex-col gap-3 text-sm">
          <pre className="whitespace-pre-wrap text-slate-200 font-sans">{JSON.stringify(result, null, 2)}</pre>
          {/* TODO: заменить на структурные блоки (Satzklammer-визуализация,
              список Verben+Präpositionen, таблица падежей), когда форма
              ответа модели стабилизируется на реальных примерах. */}
        </Card>
      )}
    </div>
  );
}
