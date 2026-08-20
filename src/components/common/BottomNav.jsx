// Нижняя навигация. Не путать с floating-input-bar — это разные слои:
// BottomNav переключает модули, floating-input-bar (внутри модуля) — поле ввода.
// Если оба видны одновременно, BottomNav должен быть выше по z-index уже не будет —
// в реальности каждый модуль сам решает, показывать ли input-bar поверх nav.
export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md
        bg-bg-deep/90 backdrop-blur-xl border-t border-surface-border
        px-2 pt-2 flex justify-between"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      {Object.entries(tabs).map(([key, { label }]) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl text-xs font-medium transition-colors
              ${isActive ? 'text-mint-400' : 'text-slate-400'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-mint-gradient' : 'bg-transparent'}`}
              aria-hidden="true"
            />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
