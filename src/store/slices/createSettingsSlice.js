// Settings-слайс: пользовательские настройки, общие для всех модулей.
// Держим тут difficulty (B1/B2 регулировка для UmschulungSimulator и B2Upgrader)
// и голосовые опции (Web Speech API конфигурируется отсюда).

export const createSettingsSlice = (set) => ({
  settings: {
    difficulty: 'B2', // 'B1' | 'B2' — регулирует сложность ответов ИИ в диалогах/апгрейдере
    voiceEnabled: true,
    voiceLang: 'de-DE',
    ttsRate: 1.0, // скорость озвучки ответов ИИ в симуляторе диалогов
    dialogueScenario: 'interview', // 'interview' | 'colleague' | 'jobcenter' | 'professional'
    dailyReminderTime: '08:00', // локальное напоминание для DailyB2Briefing (через Notification API)

    setDifficulty: (difficulty) => set((state) => ({ settings: { ...state.settings, difficulty } })),
    setVoiceEnabled: (voiceEnabled) => set((state) => ({ settings: { ...state.settings, voiceEnabled } })),
    setDialogueScenario: (dialogueScenario) => set((state) => ({ settings: { ...state.settings, dialogueScenario } })),
    setTtsRate: (ttsRate) => set((state) => ({ settings: { ...state.settings, ttsRate } })),
    setDailyReminderTime: (dailyReminderTime) => set((state) => ({ settings: { ...state.settings, dailyReminderTime } })),
  },
});
