import { useState } from 'react';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useVocabCards, useGermanStore } from '../../store/useGermanStore.js';

const BADGE_CLASS = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

// WortschatzKarten — чек-лист Fachsprache-лексики (макет: галочка слева,
// слово+артикль, категория снизу, приоритет справа). Это другая проекция
// тех же данных, что и в VocabTrainer (общий vocab-слайс, общий SRS) —
// просто вид "чек-лист" вместо флип-карточек для повторения.
export default function WortschatzKarten() {
  const cards = useVocabCards();
  const addCard = useGermanStore((s) => s.vocab.addCard);
  const toggleLearned = useGermanStore((s) => s.vocab.toggleLearned);
  const [newWord, setNewWord] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleAddWord() {
    if (!newWord.trim()) return;
    setStatus('loading');
    try {
      const enriched = await askClaude('vocabEnrich', { word: newWord.trim() });
      addCard({ word: newWord.trim(), ...enriched });
      setNewWord('');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  return (
    <Card className="animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-white">Wortschatz-Karten</h2>
      </div>
      <p className="text-xs text-slate-400 mb-3">IT-Fachsprache</p>

      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center gap-3 rounded-2xl bg-surface-raised/50 px-3 py-2.5">
            <button
              onClick={() => toggleLearned(card.id)}
              aria-label={card.learned ? 'Отметить неизученным' : 'Отметить изученным'}
              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center border
                ${card.learned ? 'bg-violet-gradient border-transparent' : 'border-slate-500'}`}
            >
              {card.learned && (
                <svg viewBox="0 0 20 20" width="13" height="13" fill="white">
                  <path d="M8 13.4 4.6 10l-1.4 1.4L8 16.2l9-9L15.6 5.8z" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {card.article ? `${card.article} ` : ''}
                {card.word}
              </p>
              <p className="text-xs text-slate-400 truncate">{card.category || 'Vocabulary'}</p>
            </div>

            <span className={BADGE_CLASS[card.priority] ?? 'badge-low'}>{card.priority ?? 'Low'}</span>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Пока нет слов — добавь первое.</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
          placeholder="Добавь слово, напр. Verantwortung"
          className="flex-1 rounded-2xl bg-surface-raised/60 border border-surface-border px-3 py-2.5
            text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40"
        />
        <button onClick={handleAddWord} disabled={status === 'loading'} className="btn-primary px-4 py-2.5 text-sm">
          {status === 'loading' ? <Spinner label="" /> : '+'}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-rose-400 mt-2">Не получилось добавить слово. Попробуй ещё раз.</p>}
    </Card>
  );
}
