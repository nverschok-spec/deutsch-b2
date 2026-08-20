import { useState } from 'react';
import Header from './components/common/Header.jsx';
import BottomNav, { DashboardIcon, GrammarIcon, CardsIcon } from './components/common/BottomNav.jsx';
import DailyB2Briefing from './components/DailyB2Briefing/DailyB2Briefing.jsx';
import B2SentenceUpgrader from './components/B2SentenceUpgrader/B2SentenceUpgrader.jsx';
import MeinB2Fortschritt from './components/MeinB2Fortschritt/MeinB2Fortschritt.jsx';
import WortschatzKarten from './components/WortschatzKarten/WortschatzKarten.jsx';
import SmartGrammarLab from './components/SmartGrammarLab/SmartGrammarLab.jsx';
import VocabTrainer from './components/VocabTrainer/VocabTrainer.jsx';
import VoiceInputBar from './components/UmschulungSimulator/VoiceInputBar.jsx';

const TABS = {
  dashboard: { label: 'Dashboard', Icon: DashboardIcon },
  grammar: { label: 'Grammar', Icon: GrammarIcon },
  cards: { label: 'Karten', Icon: CardsIcon },
};

// Dashboard — один скроллящийся экран (см. макет: три скриншота — это три
// положения скролла одной страницы). Grammar/Karten — отдельные полноэкранные
// модули, переключаются BottomNav. VoiceInputBar виден на всех вкладках,
// зафиксирован снизу вместе с BottomNav в общем .bottom-dock.
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-app-noise bg-repeat">
      <main className="flex-1 px-4 pb-[calc(theme(spacing.input-bar)+theme(spacing.nav-bar)+1rem)] flex flex-col gap-4">
        <Header />
        {activeTab === 'dashboard' && (
          <>
            <DailyB2Briefing />
            <B2SentenceUpgrader />
            <MeinB2Fortschritt />
            <WortschatzKarten />
          </>
        )}
        {activeTab === 'grammar' && <SmartGrammarLab />}
        {activeTab === 'cards' && <VocabTrainer />}
      </main>
      <div className="bottom-dock">
        <BottomNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <VoiceInputBar />
      </div>
    </div>
  );
}
