import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createVocabSlice } from './slices/createVocabSlice.js';
import { createProgressSlice } from './slices/createProgressSlice.js';
import { createSettingsSlice } from './slices/createSettingsSlice.js';
import { createBriefingSlice } from './slices/createBriefingSlice.js';

// Архитектура стора
// -----------------
// Один стор, собранный из слайсов (паттерн "slices" из документации Zustand:
// https://docs.pmnd.rs/zustand/guides/slices-pattern). Каждый слайс — это
// независимая область состояния (vocab / progress / settings / briefing),
// живущая в своём файле под ./slices. App растёт добавлением новых слайсов,
// а не разрастанием одного файла.
//
// Персистентность: весь стор целиком уходит в localStorage через
// `persist` middleware — это и есть офлайн-режим приложения (PWA открывается
// без сети и видит последнее состояние: карточки, прогресс, кэш briefing).
// `partialize` ниже явно перечисляет, что сохраняем, чтобы транзиентные
// UI-флаги (isLoading, error и т.п. внутри компонентов — их в сторе нет,
// они держатся локально в useState компонентов) никогда не просачивались
// в persisted snapshot.
//
// Почему один стор, а не пять отдельных create()?
// Модули должны уметь переиспользовать чужие данные (например,
// UmschulungSimulator может начислять XP в progress, VocabTrainer может
// подтягивать settings.difficulty) — с одним стором это просто
// `useGermanStore((s) => s.progress.addXp)` без прокидывания контекста.
export const useGermanStore = create()(
  persist(
    (...a) => ({
      ...createVocabSlice(...a),
      ...createProgressSlice(...a),
      ...createSettingsSlice(...a),
      ...createBriefingSlice(...a),
    }),
    {
      name: 'deutsch-b2-store', // ключ в localStorage
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vocab: { cards: state.vocab.cards },
        progress: {
          xp: state.progress.xp,
          streakDays: state.progress.streakDays,
          lastActiveAt: state.progress.lastActiveAt,
          conversationSeconds: state.progress.conversationSeconds,
          history: state.progress.history,
        },
        settings: {
          difficulty: state.settings.difficulty,
          voiceEnabled: state.settings.voiceEnabled,
          voiceLang: state.settings.voiceLang,
          ttsRate: state.settings.ttsRate,
          dialogueScenario: state.settings.dialogueScenario,
          dailyReminderTime: state.settings.dailyReminderTime,
        },
        briefing: {
          date: state.briefing.date,
          data: state.briefing.data,
          quizCompletedToday: state.briefing.quizCompletedToday,
          learnedPhrases: state.briefing.learnedPhrases,
        },
      }),
      // partialize вырезает методы слайсов (оставляет только данные) — поэтому
      // на регидратации нужен НЕ дефолтный merge. Дефолтный merge зустанда —
      // плоский {...currentState, ...persistedState} по ВЕРХНЕУРОВНЕВЫМ ключам:
      // он бы целиком заменил, например, state.vocab (с методами addCard и т.д.)
      // на persisted-версию (только { cards }), и addCard стал бы undefined
      // после каждой перезагрузки. Поэтому мержим данные и методы отдельно
      // на уровне каждого слайса.
      merge: (persistedState, currentState) => ({
        ...currentState,
        vocab: { ...currentState.vocab, ...persistedState?.vocab },
        progress: { ...currentState.progress, ...persistedState?.progress },
        settings: { ...currentState.settings, ...persistedState?.settings },
        briefing: { ...currentState.briefing, ...persistedState?.briefing },
      }),
      // migrate: (persistedState, version) => persistedState,
      // ^ сюда добавляем миграции, когда меняется форма стора между релизами
    }
  )
);

// ---- Точечные селекторы для частых случаев (меньше ре-рендеров) ----
export const useVocabCards = () => useGermanStore((s) => s.vocab.cards);
export const useDueVocabCards = () => useGermanStore((s) => s.vocab.getDueCards());
export const useProgress = () => useGermanStore((s) => s.progress);
export const useSettings = () => useGermanStore((s) => s.settings);
