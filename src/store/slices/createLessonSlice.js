// Lesson-слайс: "пройден ли сегодняшний пошаговый урок" (см. DailyLesson.jsx).
// Отдельно от briefing (тот кэширует контент дня) и от progress (тот просто
// копит XP/streak за любую активность) — это чисто факт "сегодняшний план
// закрыт", по образцу briefing.isFresh()/today().

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const createLessonSlice = (set, get) => ({
  lesson: {
    completedDate: null, // 'YYYY-MM-DD' — последний день, когда пройден урок

    isCompletedToday: () => get().lesson.completedDate === today(),
    markCompletedToday: () => set((state) => ({ lesson: { ...state.lesson, completedDate: today() } })),
  },
});
