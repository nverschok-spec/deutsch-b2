import Header from './components/common/Header.jsx';
import DailyB2Briefing from './components/DailyB2Briefing/DailyB2Briefing.jsx';
import B2SentenceUpgrader from './components/B2SentenceUpgrader/B2SentenceUpgrader.jsx';
import MeinB2Fortschritt from './components/MeinB2Fortschritt/MeinB2Fortschritt.jsx';
import WortschatzKarten from './components/WortschatzKarten/WortschatzKarten.jsx';
import VoiceInputBar from './components/UmschulungSimulator/VoiceInputBar.jsx';

// Дашборд — один экран, скроллится целиком (см. макет: три скриншота — это
// три положения скролла одной страницы, не три вкладки). VoiceInputBar
// зафиксирован снизу и виден при любом скролл-положении.
export default function App() {
  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-app-noise bg-repeat">
      <main className="flex-1 px-4 pb-[calc(theme(spacing.input-bar)+1rem)] flex flex-col gap-4">
        <Header />
        <DailyB2Briefing />
        <B2SentenceUpgrader />
        <MeinB2Fortschritt />
        <WortschatzKarten />
      </main>
      <VoiceInputBar />
    </div>
  );
}
