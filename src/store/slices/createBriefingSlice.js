// Briefing-слайс: кэш "утреннего обзора", чтобы не дёргать ИИ повторно
// в течение одного дня и чтобы обзор был доступен офлайн после первой
// загрузки (LocalStorage через persist в корне стора).

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const createBriefingSlice = (set, get) => ({
  briefing: {
    date: null, // 'YYYY-MM-DD' — на какой день закэширован briefing.data
    data: null, // { wordOfDay, nvVerbindung, quiz } — форма ответа см. api/claude.js
    quizCompletedToday: false,
    // Уникальные Nomen-Verb-Verbindungen, перевод которых пользователь открыл —
    // источник цифры для MeinB2Fortschritt ("Выученные N-V-Verbindungen").
    learnedPhrases: [],

    isFresh: () => get().briefing.date === today(),

    setBriefing: (data) =>
      set((state) => ({
        briefing: { ...state.briefing, date: today(), data, quizCompletedToday: false },
      })),

    markQuizCompleted: () =>
      set((state) => ({ briefing: { ...state.briefing, quizCompletedToday: true } })),

    markPhraseLearned: (phrase) =>
      set((state) => ({
        briefing: {
          ...state.briefing,
          learnedPhrases: state.briefing.learnedPhrases.includes(phrase)
            ? state.briefing.learnedPhrases
            : [...state.briefing.learnedPhrases, phrase],
        },
      })),
  },
});
