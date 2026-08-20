// Озвучка ответов ИИ через встроенный SpeechSynthesis — не требует сети,
// работает офлайн (голоса ставит ОС/браузер), поэтому не идёт через
// api/claude.js. Отдельный util, а не хук: вызывается "выстрелил и забыл"
// из нескольких мест (сейчас — UmschulungSimulator, в будущем — VocabTrainer
// для произношения слов).
export function speak(text, { lang = 'de-DE', rate = 1.0 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.cancel(); // не даём репликам накладываться друг на друга
  window.speechSynthesis.speak(utterance);
}
