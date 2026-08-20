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
  'cards.exportAnki': { ru: 'Экспорт в Anki ⇩', de: 'Nach Anki exportieren ⇩' },

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
  'settings.reminders': { ru: 'Напоминания', de: 'Erinnerungen' },
  'settings.remindersHint': { ru: 'Напомнить, если урок дня не пройден (пока приложение открыто).', de: 'Erinnert dich, falls die Tageslektion noch offen ist (solange die App geöffnet ist).' },

  'pin.lockedOut': {
    ru: 'Неверный PIN. Ввод заблокирован.',
    de: 'Falscher PIN. Die Eingabe ist gesperrt.',
  },
  'pin.enter': { ru: 'Введите PIN', de: 'PIN eingeben' },
  'pin.unlock': { ru: 'Войти', de: 'Entsperren' },

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

  'today.title': { ru: 'Сегодня', de: 'Heute' },
  'today.focus': { ru: 'В фокусе', de: 'Im Fokus' },
  'today.start': { ru: 'Начать урок', de: 'Lektion starten' },
  'today.done': { ru: 'Урок пройден', de: 'Lektion abgeschlossen' },
  'today.doneHint': { ru: 'Приходи завтра — или позанимайся ещё, сверх плана.', de: 'Komm morgen wieder — oder übe noch mehr, über den Plan hinaus.' },
  'today.step': { ru: 'Шаг', de: 'Schritt' },
  'today.close': { ru: 'Закрыть', de: 'Schließen' },
  'today.next': { ru: 'Дальше', de: 'Weiter' },
  'today.finish': { ru: 'Готово', de: 'Fertig' },

  'today.step1.title': { ru: 'Слово дня', de: 'Wort des Tages' },
  'today.step1.hint': { ru: 'Прочитай и запомни — пригодится в следующих шагах.', de: 'Lies und merke dir das — es hilft in den nächsten Schritten.' },

  'today.step2.title': { ru: 'Апгрейд предложения', de: 'Satz-Upgrade' },
  'today.step2.hint': { ru: 'Напиши простое предложение — ИИ поднимет его до B2.', de: 'Schreib einen einfachen Satz — die KI hebt ihn auf B2-Niveau.' },
  'today.step2.placeholder': { ru: 'напр. Ich habe viel Arbeit.', de: 'z. B. Ich habe viel Arbeit.' },
  'today.step2.upgrade': { ru: 'Улучшить', de: 'Verbessern' },

  'today.step3.title': { ru: 'Короткий диалог', de: 'Kurzer Dialog' },
  'today.step3.hint': { ru: 'Одна реплика по сценарию из настроек.', de: 'Eine Antwort im Szenario aus den Einstellungen.' },
  'today.step3.placeholder': { ru: 'Напиши реплику на немецком...', de: 'Schreib eine Antwort auf Deutsch...' },
  'today.step3.send': { ru: 'Отправить', de: 'Senden' },

  'today.step4.title': { ru: 'День засчитан 🎉', de: 'Tag erledigt 🎉' },
  'today.step4.hint': { ru: '+10 XP, серия дней продолжается.', de: '+10 XP, deine Serie geht weiter.' },

  'weakspots.title': { ru: 'Слабые места', de: 'Schwachstellen' },
  'weakspots.hint': { ru: 'Темы, где ИИ чаще всего тебя поправляет.', de: 'Themen, bei denen die KI dich am häufigsten korrigiert.' },

  'weekly.title': { ru: 'Неделя в цифрах', de: 'Die Woche in Zahlen' },
  'weekly.loading': { ru: 'Считаю итоги недели…', de: 'Berechne die Wochenbilanz…' },
  'weekly.error': { ru: 'Не удалось составить дайджест.', de: 'Wochenbilanz konnte nicht erstellt werden.' },

  'interview.cardTitle': { ru: 'Мок-собеседование', de: 'Probe-Vorstellungsgespräch' },
  'interview.cardHint': { ru: 'Полная сессия на 5+ реплик с разбором в конце — как перед настоящим собеседованием.', de: 'Eine volle Sitzung mit 5+ Antworten und Feedback am Ende — wie vor einem echten Gespräch.' },
  'interview.cardStart': { ru: 'Начать собеседование', de: 'Gespräch starten' },
  'interview.title': { ru: 'Мок-собеседование', de: 'Probe-Vorstellungsgespräch' },
  'interview.intro': { ru: 'Напиши первую реплику — ИИ начнёт собеседование.', de: 'Schreib die erste Antwort — die KI beginnt das Gespräch.' },
  'interview.finish': { ru: 'Завершить и получить отзыв', de: 'Beenden und Feedback erhalten' },
  'interview.finishing': { ru: 'Готовлю отзыв…', de: 'Erstelle Feedback…' },
  'interview.feedbackError': { ru: 'Не удалось получить отзыв. Попробуй ещё раз.', de: 'Feedback konnte nicht geladen werden.' },
  'interview.feedbackTitle': { ru: 'Разбор собеседования', de: 'Gesprächs-Feedback' },
  'interview.strengths': { ru: 'Сильные стороны', de: 'Stärken' },
  'interview.improvements': { ru: 'Что подтянуть', de: 'Verbesserungspotenzial' },
};

export function t(key, lang) {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.ru ?? key;
}

export function useT() {
  const lang = useGermanStore((s) => s.settings.uiLanguage) || 'ru';
  return (key) => t(key, lang);
}
