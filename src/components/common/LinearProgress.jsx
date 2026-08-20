export default function LinearProgress({ label, current, target, unit = '' }) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">
          {current}{unit} / {target}{unit}
        </p>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-gradient transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
