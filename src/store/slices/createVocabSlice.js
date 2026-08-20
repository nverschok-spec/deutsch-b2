// Vocab-слайс: карточки слов + упрощённый SM-2 (SRS).
// Каждая карточка хранит всё, что вернул ИИ (артикль, plural, пример),
// плюс SRS-метаданные (interval/easeFactor/dueDate), чтобы VocabTrainer
// мог сам решать, что показывать сегодня, без похода в БД.

const DAY_MS = 24 * 60 * 60 * 1000;

/** @typedef {{quality: 0|1|2|3|4|5}} ReviewInput — 0-2 = не помню/сложно, 3-5 = помню/легко (стандартная шкала SM-2) */

function scheduleNext(card, quality) {
  // Упрощённый SM-2: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  return {
    easeFactor,
    interval,
    repetitions,
    dueDate: Date.now() + interval * DAY_MS,
    lastReviewedAt: Date.now(),
  };
}

// Стартовые карточки, чтобы WortschatzKarten не встречал пользователя пустым
// списком при первом запуске — реальные слова, которые дальше редактируются/
// дополняются как обычные карточки (не отличаются от добавленных вручную).
const SEED_CARDS = [
  { id: 'seed-1', word: 'Datenbankmanagement', article: 'das', plural: null, category: 'IT-Fachsprache', priority: 'Medium', learned: true, meaningRu: 'управление базами данных', example: 'Das Datenbankmanagement liegt in der Verantwortung unseres Teams.' },
  { id: 'seed-2', word: 'Agilität', article: 'die', plural: null, category: 'IT-Fachsprache', priority: 'High', learned: true, meaningRu: 'гибкость (agile-подход в работе)', example: 'Agilität wird in der Softwareentwicklung großgeschrieben.' },
  { id: 'seed-3', word: 'Quellcode', article: 'der', plural: 'die Quellcodes', category: 'IT-Fachsprache', priority: 'Low', learned: true, meaningRu: 'исходный код', example: 'Der Quellcode wird im internen Repository verwaltet.' },
];

export const createVocabSlice = (set, get) => ({
  vocab: {
    cards: SEED_CARDS, // { id, word, article, plural, meaningRu, example, category, priority, learned, createdAt, ...srsFields }

    addCard: (card) =>
      set((state) => ({
        vocab: {
          ...state.vocab,
          cards: [
            ...state.vocab.cards,
            {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              dueDate: Date.now(), // новая карточка доступна для повторения сразу
              lastReviewedAt: null,
              learned: false,
              ...card,
            },
          ],
        },
      })),

    updateCard: (id, patch) =>
      set((state) => ({
        vocab: {
          ...state.vocab,
          cards: state.vocab.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        },
      })),

    toggleLearned: (id) =>
      set((state) => ({
        vocab: {
          ...state.vocab,
          cards: state.vocab.cards.map((c) => (c.id === id ? { ...c, learned: !c.learned } : c)),
        },
      })),

    removeCard: (id) =>
      set((state) => ({
        vocab: { ...state.vocab, cards: state.vocab.cards.filter((c) => c.id !== id) },
      })),

    /** Отметить результат повторения — двигает карточку по SRS-расписанию */
    reviewCard: (id, quality) =>
      set((state) => ({
        vocab: {
          ...state.vocab,
          cards: state.vocab.cards.map((c) => (c.id === id ? { ...c, ...scheduleNext(c, quality) } : c)),
        },
      })),

    /** Карточки, которые пора повторить сегодня */
    getDueCards: () => {
      const now = Date.now();
      return get().vocab.cards.filter((c) => c.dueDate <= now);
    },
  },
});
