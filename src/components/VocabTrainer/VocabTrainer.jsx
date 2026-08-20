import { useState } from 'react';
import Card from '../common/Card.jsx';
import { PrimaryButton, SecondaryButton } from '../common/Button.jsx';
import Spinner from '../common/Spinner.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore, useDueVocabCards, useVocabCards } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';
import { downloadAnkiExport } from '../../utils/exportAnki.js';

// Модуль 4: добавление слова (ИИ дотягивает артикль/plural/пример) +
// SRS-повторение карточек, которые "созрели" (см. slices/createVocabSlice.js).
export default function VocabTrainer() {
  const [newWord, setNewWord] = useState('');
  const [status, setStatus] = useState('idle');
  const addCard = useGermanStore((s) => s.vocab.addCard);
  const reviewCard = useGermanStore((s) => s.vocab.reviewCard);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const dueCards = useDueVocabCards();
  const allCards = useVocabCards();
  const [revealIndex, setRevealIndex] = useState(null);
  const t = useT();

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

  function handleReview(id, quality) {
    reviewCard(id, quality);
    if (quality >= 3) addXp(1, 'vocab');
    setRevealIndex(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('cards.title')}</h1>
          <p className="text-sm text-slate-400">{dueCards.length} {t('cards.dueToday')}</p>
        </div>
        {allCards.length > 0 && (
          <button
            onClick={() => downloadAnkiExport(allCards)}
            className="text-xs text-violet-400 underline whitespace-nowrap mt-1"
          >
            {t('cards.exportAnki')}
          </button>
        )}
      </header>

      <Card>
        <div className="flex gap-2">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder={t('cards.addPlaceholder')}
            className="flex-1 bg-transparent outline-none placeholder:text-slate-500"
          />
          <PrimaryButton onClick={handleAddWord} disabled={status === 'loading'}>
            {status === 'loading' ? <Spinner label="" /> : '+'}
          </PrimaryButton>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {dueCards.map((card, i) => {
          const isRevealed = revealIndex === i;
          return (
            <Card key={card.id} className="animate-fade-in">
              <button className="w-full text-left" onClick={() => setRevealIndex(isRevealed ? null : i)}>
                <p className="font-serif text-lg">
                  {card.article ? `${card.article} ` : ''}
                  {card.word}
                  {card.plural ? ` (Pl. ${card.plural})` : ''}
                </p>
                {isRevealed && (
                  <div className="mt-2 text-sm text-slate-400 animate-fade-in">
                    <p>{card.meaningRu}</p>
                    <p className="italic mt-1 text-slate-300">{card.example}</p>
                  </div>
                )}
              </button>
              {isRevealed && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <SecondaryButton onClick={() => handleReview(card.id, 1)} className="text-xs text-rose-300">
                    {t('cards.forgot')}
                  </SecondaryButton>
                  <SecondaryButton onClick={() => handleReview(card.id, 3)} className="text-xs text-amber-300">
                    {t('cards.hard')}
                  </SecondaryButton>
                  <SecondaryButton onClick={() => handleReview(card.id, 5)} className="text-xs text-violet-300">
                    {t('cards.easy')}
                  </SecondaryButton>
                </div>
              )}
            </Card>
          );
        })}
        {dueCards.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">{t('cards.allDone')}</p>
        )}
      </div>
    </div>
  );
}
