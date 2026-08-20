// WeakSpots-слайс: счётчик тем, по которым ИИ чаще всего исправляет
// пользователя (grammar-теги из dialogueTurn.correctionTopic и
// upgradeSentence.changes[].topic — см. api/claude.js). Никакой отдельной
// AI-задачи для этого нет: считаем то, что уже приходит с обычных ответов.

export const createWeakSpotsSlice = (set, get) => ({
  weakSpots: {
    counts: {}, // { [topic: string]: number }

    recordTopic: (topic) => {
      if (!topic) return;
      set((state) => ({
        weakSpots: {
          ...state.weakSpots,
          counts: { ...state.weakSpots.counts, [topic]: (state.weakSpots.counts[topic] || 0) + 1 },
        },
      }));
    },

    /** @returns {{topic: string, count: number}[]} топ-N тем по частоте */
    topWeakSpots: (n = 3) =>
      Object.entries(get().weakSpots.counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([topic, count]) => ({ topic, count })),
  },
});
