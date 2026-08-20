// Инлайновая SVG-версия иконки приложения (см. public/icons/ и
// scripts/generate_icons.py за источником той же формы для PNG).
// Инлайн, а не <img>, чтобы иконка оставалась чёткой на любом размере
// и не требовала отдельного сетевого запроса в шапке.
export default function SparkleIcon({ size = 44, className = '' }) {
  return (
    <div
      className={`shrink-0 rounded-2xl bg-violet-gradient shadow-glow-violet flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="white">
        <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
        <path d="M19 2 L19.9 4.6 L22.5 5.5 L19.9 6.4 L19 9 L18.1 6.4 L15.5 5.5 L18.1 4.6 Z" opacity="0.85" />
      </svg>
    </div>
  );
}
