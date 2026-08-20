// Единый индикатор "ИИ думает" — используется во всех модулях, которые
// дожидаются ответа от /api/claude, чтобы UX ожидания был одинаковым.
export default function Spinner({ label = 'Думаю…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400 animate-fade-in">
      <span className="h-2 w-2 rounded-full bg-violet-gradient animate-pulse-slow" />
      <span>{label}</span>
    </div>
  );
}
