import { useGermanStore } from '../store/useGermanStore.js';

// Лёгкий i18n для интерфейса (кнопки/заголовки/подписи) — не для немецкого
// учебного контента, тот всегда на немецком. RU — язык по умолчанию (весь
// текущий UI уже написан на русском), DE — режим полного погружения.
const STRINGS = {
  'nav.dashboard': { ru: 'Дашборд', de: 'Dashboard' },
  'nav.grammar': { ru: 'Грамматика', de: 'Grammatik' },
  'nav.cards': { ru: 'Карточки', de: 'Karten' },
  'nav.settings': { ru: 'Настройки', de: 'Einstellungen' },

  'upgrader.title': { ru: 'Улучшатель предложений B2', de: 'B2-Satz-Upgrader' },
  'upgrader.analyze': { ru: 'Анализировать', de: 'Analysieren' },
  'upgrader.analyzing': { ru: 'Анализирую…', de: 'Analysiere…' },
  'upgrader.error': { ru: 'Не получилось получить ответ. Попробуй ещё раз.', de: 'Antwort fehlgeschlagen. Versuch es noch einmal.' },
  'upgrader.showDetails': { ru: 'Показать разбор ▾', de: 'Details anzeigen ▾' },
  'upgrader.hideDetails': { ru: 'Скрыть разбор', de: 'Details verbergen' },

  'grammar.title': { ru: 'Грамматическая лаборатория', de: 'Smart Grammar Lab' },
  'grammar.subtitle': { ru: 'Разбор Satzklammer, управления глаголов и падежей.', de: 'Analyse von Satzklammer, Rektion und Kasus.' },
  'grammar.analyze': { ru: 'Разобрать', de: 'Analysieren' },
  'grammar.analyzing': { ru: 'Разбираю…', de: 'Analysiere…' },
  'grammar.error': { ru: 'Не получилось получить разбор. Попробуй ещё раз.', de: 'Analyse fehlgeschlagen. Versuch es noch einmal.' },

  'cards.title': { ru: 'Карточки', de: 'Karten' },
  'cards.dueToday': { ru: 'на повторение сегодня', de: 'heute zu wiederholen' },
  'cards.addPlaceholder': { ru: 'Добавь слово, напр. Verantwortung', de: 'Wort hinzufügen, z. B. Verantwortung' },
  'cards.allDone': { ru: 'Все карточки повторены. Загляни завтра 🎉', de: 'Alle Karten wiederholt. Bis morgen 🎉' },
  'cards.forgot': { ru: 'Забыл', de: 'Vergessen' },
  'cards.hard': { ru: 'Сложно', de: 'Schwer' },
  'cards.easy': { ru: 'Легко', de: 'Leicht' },
  'cards.error': { ru: 'Не получилось добавить слово. Попробуй ещё раз.', de: 'Wort konnte nicht hinzugefügt werden.' },

  'wortschatz.title': { ru: 'Словарные карточки', de: 'Wortschatz-Karten' },
  'wortschatz.empty': { ru: 'Пока нет слов — добавь первое.', de: 'Noch keine Wörter — füge das erste hinzu.' },
  'wortschatz.error': { ru: 'Не получилось добавить слово. Попробуй ещё раз.', de: 'Wort konnte nicht hinzugefügt werden.' },

  'voicebar.title': { ru: 'Тренажёр диалогов', de: 'Dialog-Trainer' },
  'voicebar.placeholder': { ru: 'Введите сообщение...', de: 'Nachricht eingeben...' },
  'voicebar.tapToSpeak': { ru: 'Нажмите и говорите', de: 'Tippen und sprechen' },
  'voicebar.listening': { ru: 'Слушаю…', de: 'Ich höre zu…' },
  'voicebar.notSupported': { ru: 'Голосовой ввод недоступен в этом браузере', de: 'Spracheingabe in diesem Browser nicht verfügbar' },
  'voicebar.error': { ru: 'Ошибка соединения. Попробуй ещё раз.', de: 'Verbindungsfehler. Versuch es noch einmal.' },
  'voicebar.thinking': { ru: 'ИИ отвечает…', de: 'KI antwortet…' },

  'scenario.interview': { ru: 'Собеседование', de: 'Vorstellungsgespräch' },
  'scenario.colleague': { ru: 'С коллегой', de: 'Kollegengespräch' },
  'scenario.jobcenter': { ru: 'Jobcenter', de: 'Jobcenter' },
  'scenario.professional': { ru: 'Fachthema', de: 'Fachthema' },

  'settings.title': { ru: 'Настройки', de: 'Einstellungen' },
  'settings.language': { ru: 'Язык интерфейса', de: 'Sprache der Oberfläche' },
  'settings.teachingProfile': { ru: 'Как тебя учить', de: 'Lernprofil' },
  'settings.focus': { ru: 'Фокус', de: 'Fokus' },
  'settings.focus.balanced': { ru: 'Сбалансированно', de: 'Ausgewogen' },
  'settings.focus.grammar': { ru: 'Грамматика', de: 'Grammatik' },
  'settings.focus.vocab': { ru: 'Словарный запас', de: 'Wortschatz' },
  'settings.focus.speaking': { ru: 'Разговорная речь', de: 'Sprechen' },
  'settings.strictness': { ru: 'Строгость исправлений', de: 'Strenge der Korrekturen' },
  'settings.strictness.gentle': { ru: 'Мягко', de: 'Sanft' },
  'settings.strictness.balanced': { ru: 'Сбалансированно', de: 'Ausgewogen' },
  'settings.strictness.strict': { ru: 'Строго', de: 'Streng' },
  'settings.tone': { ru: 'Тон общения', de: 'Tonfall' },
  'settings.tone.friendly': { ru: 'Дружелюбный', de: 'Freundlich' },
  'settings.tone.professional': { ru: 'Деловой', de: 'Professionell' },
  'settings.myPlan': { ru: 'Мой план', de: 'Mein Plan' },
  'settings.retakeTest': { ru: 'Пройти тест заново', de: 'Test wiederholen' },
  'settings.pinSection': { ru: 'Защита PIN-кодом', de: 'PIN-Schutz' },
  'settings.pinSet': { ru: 'PIN установлен', de: 'PIN ist gesetzt' },
  'settings.pinNotSet': { ru: 'PIN не установлен', de: 'Kein PIN gesetzt' },
  'settings.setPin': { ru: 'Установить PIN', de: 'PIN festlegen' },
  'settings.changePin': { ru: 'Изменить PIN', de: 'PIN ändern' },
  'settings.removePin': { ru: 'Убрать PIN', de: 'PIN entfernen' },
  'settings.cancel': { ru: 'Отмена', de: 'Abbrechen' },
  'settings.save': { ru: 'Сохранить', de: 'Speichern' },

  'pin.newPin': { ru: 'Новый PIN (4 цифры)', de: 'Neuer PIN (4 Ziffern)' },
  'pin.confirmPin': { ru: 'Повтори PIN', de: 'PIN wiederholen' },
  'pin.recoveryQuestion': { ru: 'Секретный вопрос (для сброса)', de: 'Sicherheitsfrage (für Reset)' },
  'pin.recoveryAnswer': { ru: 'Ответ', de: 'Antwort' },
  'pin.mismatch': { ru: 'PIN не совпадает', de: 'PIN stimmt nicht überein' },
  'pin.invalid': { ru: 'PIN должен быть из 4 цифр', de: 'PIN muss 4 Ziffern haben' },
  'pin.enter': { ru: 'Введите PIN', de: 'PIN eingeben' },
  'pin.wrong': { ru: 'Неверный PIN', de: 'Falscher PIN' },
  'pin.unlock': { ru: 'Войти', de: 'Entsperren' },
  'pin.forgot': { ru: 'Забыл PIN?', de: 'PIN vergessen?' },
  'pin.answerWrong': { ru: 'Неверный ответ', de: 'Falsche Antwort' },
  'pin.back': { ru: 'Назад', de: 'Zurück' },

  'onboarding.welcome': { ru: 'Прежде чем начать', de: 'Bevor wir beginnen' },
  'onboarding.levelQuestion': { ru: 'Какой у тебя сейчас уровень немецкого?', de: 'Wie ist dein aktuelles Deutschniveau?' },
  'onboarding.fachbereichQuestion': { ru: 'В какой сфере твой Umschulung? (необязательно)', de: 'In welchem Bereich machst du deine Umschulung? (optional)' },
  'onboarding.fachbereichPlaceholder': { ru: 'напр. IT, Pflege, Buchhaltung', de: 'z. B. IT, Pflege, Buchhaltung' },
  'onboarding.continue': { ru: 'Составить план', de: 'Plan erstellen' },
  'onboarding.planTitle': { ru: 'Твой план готов', de: 'Dein Plan ist fertig' },
  'onboarding.planMinutes': { ru: 'мин/день', de: 'Min/Tag' },
  'onboarding.start': { ru: 'Начать', de: 'Loslegen' },

  'progress.title': { ru: 'Мой прогресс B2', de: 'Mein B2 Fortschritt' },
  'progress.level': { ru: 'Уровень', de: 'Niveau' },
  'progress.nvLearned': { ru: 'Выученные N-V-Verbindungen', de: 'Gelernte N-V-Verbindungen' },
  'progress.conversationMinutes': { ru: 'Минуты разговора', de: 'Gesprächsminuten' },
  'progress.min': { ru: ' мин', de: ' Min' },

  'briefing.title': { ru: 'Брифинг дня', de: 'Daily B2 Briefing' },
  'briefing.loading': { ru: 'Готовлю обзор…', de: 'Bereite Überblick vor…' },
  'briefing.retry': { ru: 'Не удалось загрузить — повторить', de: 'Laden fehlgeschlagen — erneut versuchen' },
  'briefing.nvOfDay': { ru: 'Nomen-Verb-Verbindung des Tages', de: 'Nomen-Verb-Verbindung des Tages' },
  'briefing.showTranslation': { ru: 'Показать перевод', de: 'Übersetzung anzeigen' },
};

export function t(key, lang) {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.ru ?? key;
}

export function useT() {
  const lang = useGermanStore((s) => s.settings.uiLanguage) || 'ru';
  return (key) => t(key, lang);
}
