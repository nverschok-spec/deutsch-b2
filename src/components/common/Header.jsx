import SparkleIcon from './SparkleIcon.jsx';

// Header.jsx — шапка дашборда, как в макете: иконка приложения слева,
// заголовок справа. Один раз в App.jsx, не повторяется в модулях.
export default function Header() {
  return (
    <header className="flex items-center gap-3 pt-2 pb-1">
      <SparkleIcon size={48} />
      <h1 className="text-xl font-bold text-white leading-tight">Deutsch B2 Umschulung Trainer</h1>
    </header>
  );
}
