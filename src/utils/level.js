// Перевод XP в "уровень" для кольца прогресса в MeinB2Fortschritt.
// Пороги — грубая оценка (не привязана к реальному CEFR-тесту), задача —
// дать ощущение движения B1 → B2, а не сертифицировать уровень.
const LEVELS = [
  { label: 'B1', from: 0, to: 300 },
  { label: 'B1+', from: 300, to: 800 },
  { label: 'B2', from: 800, to: 2000 },
  { label: 'B2+', from: 2000, to: 5000 },
];

export function xpToLevel(xp) {
  const band = LEVELS.find((l) => xp < l.to) ?? LEVELS[LEVELS.length - 1];
  const span = band.to - band.from;
  const percent = span > 0 ? Math.min(100, Math.round(((xp - band.from) / span) * 100)) : 100;
  return { label: band.label, percent: Math.max(0, percent) };
}
