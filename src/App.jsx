import { useState } from 'react';
import Header from './components/common/Header.jsx';
import BottomNav, { DashboardIcon, GrammarIcon, CardsIcon, SettingsIcon } from './components/common/BottomNav.jsx';
import DailyB2Briefing from './components/DailyB2Briefing/DailyB2Briefing.jsx';
import B2SentenceUpgrader from './components/B2SentenceUpgrader/B2SentenceUpgrader.jsx';
import MeinB2Fortschritt from './components/MeinB2Fortschritt/MeinB2Fortschritt.jsx';
import WortschatzKarten from './components/WortschatzKarten/WortschatzKarten.jsx';
import SmartGrammarLab from './components/SmartGrammarLab/SmartGrammarLab.jsx';
import VocabTrainer from './components/VocabTrainer/VocabTrainer.jsx';
import Settings from './components/Settings/Settings.jsx';
import Onboarding from './components/Onboarding/Onboarding.jsx';
import PinLock from './components/PinLock/PinLock.jsx';
import VoiceInputBar from './components/UmschulungSimulator/VoiceInputBar.jsx';
import { useGermanStore } from './store/useGermanStore.js';
import { useT } from './utils/i18n.js';

const TAB_KEYS = {
  dashboard: { labelKey: 'nav.dashboard', Icon: DashboardIcon },
  grammar: { labelKey: 'nav.grammar', Icon: GrammarIcon },
  cards: { labelKey: 'nav.cards', Icon: CardsIcon },
  settings: { labelKey: 'nav.settings', Icon: SettingsIcon },
};

// Dashboard — один скроллящийся экран (см. макет: три скриншота — это три
// положения скролла одной страницы). Grammar/Karten/Settings — отдельные
// полноэкранные модули, переключаются BottomNav. VoiceInputBar виден на
// всех вкладках, зафиксирован снизу вместе с BottomNav в общем .bottom-dock.
//
// Перед основным приложением — два возможных гейта (App-уровня, не роуты):
// PinLock (каждый холодный старт, пока не введён верный PIN — см.
// createSettingsSlice.js: один фиксированный PIN, без самостоятельного
// сброса — "не хочу, чтобы кто попало зашёл") и только потом Onboarding
// (один раз, пока !settings.onboardingCompleted).
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = useT();
  const onboardingCompleted = useGermanStore((s) => s.settings.onboardingCompleted);
  const isUnlocked = useGermanStore((s) => s.settings.isUnlocked);

  if (!isUnlocked) return <PinLock />;
  if (!onboardingCompleted) return <Onboarding />;

  const tabs = Object.fromEntries(
    Object.entries(TAB_KEYS).map(([key, { labelKey, Icon }]) => [key, { label: t(labelKey), Icon }])
  );

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
        {activeTab === 'settings' && <Settings />}
      </main>
      <div className="bottom-dock">
        <BottomNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <VoiceInputBar />
      </div>
    </div>
  );
}
