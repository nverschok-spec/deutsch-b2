import { useEffect } from 'react';
import { useGermanStore } from '../store/useGermanStore.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Best-effort напоминание, ПОКА страница/PWA открыта (вкладка активна или
// в фоне у ОС, но не выгружена) — это НЕ настоящий push. Настоящий push,
// который будит закрытое приложение, требует Push API + VAPID-ключи +
// сервер, хранящий подписки и стреляющий по расписанию (напр. Vercel Cron) —
// такой инфраструктуры здесь сознательно нет (см. CLAUDE.md: не подключать
// новую инфраструктуру без явного согласия). Раз в минуту проверяем, не
// пора ли показать сегодняшнее напоминание, и не показываем его дважды.
export function useDailyReminder() {
  const notificationsEnabled = useGermanStore((s) => s.settings.notificationsEnabled);
  const dailyReminderTime = useGermanStore((s) => s.settings.dailyReminderTime);
  const lastReminderShownDate = useGermanStore((s) => s.settings.lastReminderShownDate);
  const markReminderShownToday = useGermanStore((s) => s.settings.markReminderShownToday);
  const isCompletedToday = useGermanStore((s) => s.lesson.isCompletedToday());

  useEffect(() => {
    if (!notificationsEnabled || typeof Notification === 'undefined') return;
    if (isCompletedToday || lastReminderShownDate === today()) return;

    function check() {
      if (Notification.permission !== 'granted') return;
      const [h, m] = dailyReminderTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (new Date() >= target) {
        new Notification('Deutsch B2 Umschulung Trainer', {
          body: 'Не пропусти сегодняшний урок 🇩🇪',
          icon: '/icons/icon-192.png',
        });
        markReminderShownToday();
      }
    }

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [notificationsEnabled, dailyReminderTime, lastReminderShownDate, isCompletedToday, markReminderShownToday]);
}
