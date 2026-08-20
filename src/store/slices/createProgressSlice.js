// Progress-слайс: XP, streak (дни подряд) и лёгкая история активности —
// используется в DailyB2Briefing и как общий мотивационный слой поверх
// всех модулей (любой модуль просто зовёт addXp при завершении действия).

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
}

function isYesterday(prevTs, nowTs) {
  const oneDayAgo = new Date(nowTs);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return isSameDay(prevTs, oneDayAgo.getTime());
}

export const createProgressSlice = (set, get) => ({
  progress: {
    xp: 0,
    streakDays: 0,
    lastActiveAt: null,
    // Реальное накопленное время разговора с ИИ в UmschulungSimulator (секунды).
    // Считается от факта записи (start/stop распознавания речи), не оценка "на глаз".
    conversationSeconds: 0,
    // { date: 'YYYY-MM-DD', module: string, xp: number }[] — храним компактно,
    // достаточно для недельного графика в DailyB2Briefing
    history: [],

    addConversationSeconds: (seconds) =>
      set((state) => ({
        progress: { ...state.progress, conversationSeconds: state.progress.conversationSeconds + seconds },
      })),

    /** @param {number} amount @param {'briefing'|'upgrader'|'grammar'|'vocab'|'simulator'|'lesson'} module */
    addXp: (amount, module) =>
      set((state) => {
        const now = Date.now();
        const { lastActiveAt, streakDays } = state.progress;

        let nextStreak = streakDays;
        if (!lastActiveAt || !isSameDay(lastActiveAt, now)) {
          nextStreak = lastActiveAt && isYesterday(lastActiveAt, now) ? streakDays + 1 : 1;
        }

        return {
          progress: {
            ...state.progress,
            xp: state.progress.xp + amount,
            streakDays: nextStreak,
            lastActiveAt: now,
            history: [
              ...state.progress.history.slice(-99), // держим последние 100 записей
              { date: new Date(now).toISOString().slice(0, 10), module, xp: amount },
            ],
          },
        };
      }),

    /** Streak "жив" сегодня или вчера был активен — используем в briefing для UI ("не теряй серию!") */
    isStreakAtRisk: () => {
      const { lastActiveAt } = get().progress;
      if (!lastActiveAt) return false;
      const now = Date.now();
      return !isSameDay(lastActiveAt, now) && isYesterday(lastActiveAt, now);
    },
  },
});
