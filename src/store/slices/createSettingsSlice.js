import { sha256Hex } from '../../utils/hash.js';

// Settings-слайс: пользовательские настройки, общие для всех модулей.
// Держим тут difficulty (B1/B2 регулировка для UmschulungSimulator и B2Upgrader),
// голосовые опции, профиль обучения (как ИИ должен вести себя в промптах),
// язык интерфейса и мягкую PIN-защиту (см. README — это client-only PWA без
// бэкенда, поэтому PIN не настоящая безопасность, а щит от случайного человека,
// взявшего телефон).
//
// PIN — один фиксированный код на всех, зашит в коде (не настраивается через
// UI намеренно: нет самостоятельного сброса/восстановления — "не хочу, чтобы
// кто попало зашёл" важнее удобства смены пароля). Хэш, а не открытый текст,
// просто чтобы код 202219 не лежал в бандле буквально — но это всё равно
// клиентский код, так что это не защита от reverse-engineering, а щит от
// случайного взгляда через DevTools.
const FIXED_PIN_HASH = 'a39cde4bba50a324fce1dddddc01b75c1e7cf5084d202ce97e63272c882c22df'; // sha256("202219")

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

    // isUnlocked НЕ персистится (см. partialize в useGermanStore.js), поэтому
    // после каждого холодного старта приложение снова заблокировано.
    isUnlocked: false,
    // После одной неверной попытки дальнейший ввод PIN блокируется — без
    // самостоятельного восстановления (см. комментарий у FIXED_PIN_HASH).
    // Персистится, чтобы обход через простой reload не работал.
    pinAttemptLocked: false,

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

    tryUnlock: async (pin) => {
      if (get().settings.pinAttemptLocked) return false;
      const hash = await sha256Hex(pin);
      const ok = hash === FIXED_PIN_HASH;
      set((state) => ({ settings: { ...state.settings, isUnlocked: ok, pinAttemptLocked: ok ? false : true } }));
      return ok;
    },
  },
});
