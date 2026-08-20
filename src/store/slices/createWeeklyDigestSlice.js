// WeeklyDigest-слайс: раз в неделю (не каждый день, дороже дневного briefing
// не станет, вызов один раз в 7 дней) кэшируем AI-саммари недели — по образцу
// today()/isFresh() из briefing-слайса, только с началом недели вместо дня.

export function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Вс..6=Сб
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export const createWeeklyDigestSlice = (set, get) => ({
  weeklyDigest: {
    weekStart: null, // 'YYYY-MM-DD' (понедельник) — на какую неделю закэширован data
    data: null, // { summary, nextFocus }

    isFresh: () => get().weeklyDigest.weekStart === mondayOf(new Date()),

    setDigest: (data) =>
      set((state) => ({
        weeklyDigest: { ...state.weeklyDigest, weekStart: mondayOf(new Date()), data },
      })),
  },
});
