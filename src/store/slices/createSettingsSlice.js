import { sha256Hex, normalizeAnswer } from '../../utils/hash.js';

// Settings-слайс: пользовательские настройки, общие для всех модулей.
// Держим тут difficulty (B1/B2 регулировка для UmschulungSimulator и B2Upgrader),
// голосовые опции, профиль обучения (как ИИ должен вести себя в промптах),
// язык интерфейса и мягкую PIN-защиту (см. README — это client-only PWA без
// бэкенда, поэтому PIN не настоящая безопасность, а щит от случайного человека,
// взявшего телефон; сбрасывается через секретный вопрос или очистку данных сайта).

export const createSettingsSlice = (set, get) => ({
  settings: {
    difficulty: 'B2', // 'B1' | 'B2' — регулирует сложность ответов ИИ в диалогах/апгрейдере
    voiceEnabled: true,
    voiceLang: 'de-DE',
    ttsRate: 1.0, // скорость озвучки ответов ИИ в симуляторе диалогов
    dialogueScenario: 'interview', // 'interview' | 'colleague' | 'jobcenter' | 'professional'
    dailyReminderTime: '08:00', // локальное напоминание для DailyB2Briefing (через Notification API)

    uiLanguage: 'ru', // 'ru' | 'de' — язык интерфейса (не влияет на немецкий учебный контент)

    // Профиль обучения — уходит в system-промпты api/claude.js, определяет
    // на чём ИИ делает акцент и в каком тоне отвечает.
    teachingProfile: {
      focus: 'balanced', // 'balanced' | 'grammar' | 'vocab' | 'speaking'
      strictness: 'balanced', // 'gentle' | 'balanced' | 'strict'
      tone: 'friendly', // 'friendly' | 'professional'
    },

    // Онбординг: самооценка уровня при первом запуске (см. Onboarding.jsx).
    onboardingCompleted: false,
    level: null, // 'A2' | 'A2-B1' | 'B1' | 'B1-B2' | 'B2'
    fachbereich: '', // напр. "IT", "Pflege" — свободный текст из онбординга

    // PIN — хэши, не сырой текст. isUnlocked НЕ персистится (см. partialize
    // в useGermanStore.js), поэтому после каждого холодного старта приложение
    // снова заблокировано, если pinHash задан.
    pinHash: null,
    recoveryQuestion: '',
    recoveryAnswerHash: null,
    isUnlocked: false,

    setDifficulty: (difficulty) => set((state) => ({ settings: { ...state.settings, difficulty } })),
    setVoiceEnabled: (voiceEnabled) => set((state) => ({ settings: { ...state.settings, voiceEnabled } })),
    setDialogueScenario: (dialogueScenario) => set((state) => ({ settings: { ...state.settings, dialogueScenario } })),
    setTtsRate: (ttsRate) => set((state) => ({ settings: { ...state.settings, ttsRate } })),
    setDailyReminderTime: (dailyReminderTime) => set((state) => ({ settings: { ...state.settings, dailyReminderTime } })),

    setUiLanguage: (uiLanguage) => set((state) => ({ settings: { ...state.settings, uiLanguage } })),

    setTeachingProfile: (partial) =>
      set((state) => ({ settings: { ...state.settings, teachingProfile: { ...state.settings.teachingProfile, ...partial } } })),

    completeOnboarding: ({ level, fachbereich }) =>
      set((state) => ({
        settings: {
          ...state.settings,
          level,
          fachbereich,
          difficulty: level === 'B1-B2' || level === 'B2' ? 'B2' : 'B1',
          onboardingCompleted: true,
        },
      })),
    resetOnboarding: () => set((state) => ({ settings: { ...state.settings, onboardingCompleted: false } })),

    setPin: async (pin, recoveryQuestion, recoveryAnswer) => {
      const pinHash = await sha256Hex(pin);
      const recoveryAnswerHash = await sha256Hex(normalizeAnswer(recoveryAnswer));
      set((state) => ({
        settings: { ...state.settings, pinHash, recoveryQuestion, recoveryAnswerHash, isUnlocked: true },
      }));
    },
    removePin: () => set((state) => ({ settings: { ...state.settings, pinHash: null, recoveryQuestion: '', recoveryAnswerHash: null, isUnlocked: true } })),
    tryUnlock: async (pin) => {
      const hash = await sha256Hex(pin);
      const ok = hash === get().settings.pinHash;
      if (ok) set((state) => ({ settings: { ...state.settings, isUnlocked: true } }));
      return ok;
    },
    tryRecoverWithAnswer: async (answer) => {
      const hash = await sha256Hex(normalizeAnswer(answer));
      const ok = hash === get().settings.recoveryAnswerHash;
      if (ok) {
        set((state) => ({
          settings: { ...state.settings, pinHash: null, recoveryQuestion: '', recoveryAnswerHash: null, isUnlocked: true },
        }));
      }
      return ok;
    },
  },
});
