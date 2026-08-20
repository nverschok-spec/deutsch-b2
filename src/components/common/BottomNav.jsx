// Нижняя навигация между дашбордом и полноэкранными модулями (Grammar/Cards).
// Не позиционируется сама — едет внутри .bottom-dock вместе с VoiceInputBar
// (см. App.jsx), поэтому всегда сидит прямо над input-панелью.
export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="bottom-nav-bar">
      {Object.entries(tabs).map(([key, { label, Icon }]) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center gap-1 pb-2 rounded-2xl text-xs font-medium transition-colors
              ${isActive ? 'text-violet-400' : 'text-slate-400'}`}
          >
            <Icon active={isActive} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 L12 4 L20 12" />
      <path d="M6 10.5 V20 H18 V10.5" />
    </svg>
  );
}

export function GrammarIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5 C10 3.5 6.5 3.5 4 4.5 V18 C6.5 17 10 17 12 18.5 C14 17 17.5 17 20 18 V4.5 C17.5 3.5 14 3.5 12 5 Z" />
      <path d="M12 5 V18.5" />
    </svg>
  );
}

export function CardsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="7" width="14" height="13" rx="2.5" />
      <path d="M8 7 V5.5 A2.5 2.5 0 0 1 10.5 3 H16 A2.5 2.5 0 0 1 18.5 5.5 V15" />
    </svg>
  );
}
