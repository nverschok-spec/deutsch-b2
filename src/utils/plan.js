// Учебный план — чистая функция от уровня + сферы Umschulung (из онбординга).
// Без ИИ-запроса: правило-based, чтобы план был мгновенным и бесплатным.
const FOCUS_BY_LEVEL = {
  A2: ['Grammatik-Grundlagen: Satzbau, Perfekt/Präteritum', 'Alltagswortschatz'],
  'A2-B1': ['Nebensätze: weil, dass, wenn, obwohl', 'Alltags- und erste Fachbegriffe'],
  B1: ['Nebensätze & Konnektoren (deshalb, trotzdem, je... desto)', 'Fachwortschatz'],
  'B1-B2': ['Passiv & Konjunktiv II', 'Nomen-Verb-Verbindungen, Fachwortschatz'],
  B2: ['B2-Satzbau: Passiv, Konjunktiv II, Nominalisierung', 'Mündliche Flüssigkeit für Bewerbungsgespräche'],
};

const MINUTES_BY_LEVEL = {
  A2: 20,
  'A2-B1': 20,
  B1: 15,
  'B1-B2': 15,
  B2: 10,
};

export function buildPlan({ level, fachbereich }) {
  const focusAreas = FOCUS_BY_LEVEL[level] ?? FOCUS_BY_LEVEL.B1;
  const dailyTargetMinutes = MINUTES_BY_LEVEL[level] ?? 15;
  const fachTag = fachbereich?.trim() ? fachbereich.trim() : null;
  return {
    focusAreas: fachTag ? [...focusAreas.slice(0, 1), `Fachwortschatz: ${fachTag}`] : focusAreas,
    dailyTargetMinutes,
  };
}
