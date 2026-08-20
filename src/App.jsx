import { useState } from 'react';
import Header from './components/common/Header.jsx';
import BottomNav, { DashboardIcon, GrammarIcon, CardsIcon, SettingsIcon } from './components/common/BottomNav.jsx';
import DailyB2Briefing from './components/DailyB2Briefing/DailyB2Briefing.jsx';
import B2SentenceUpgrader from './components/B2SentenceUpgrader/B2SentenceUpgrader.jsx';
import MeinB2Fortschritt from './components/MeinB2Fortschritt/MeinB2Fortschritt.jsx';
import WeakSpotsCard from './components/MeinB2Fortschritt/WeakSpotsCard.jsx';
import WortschatzKarten from './components/WortschatzKarten/WortschatzKarten.jsx';
import WeeklyDigestCard from './components/WeeklyDigest/WeeklyDigestCard.jsx';
import SmartGrammarLab from './components/SmartGrammarLab/SmartGrammarLab.jsx';
import VocabTrainer from './components/VocabTrainer/VocabTrainer.jsx';
import Settings from './components/Settings/Settings.jsx';
import Onboarding from './components/Onboarding/Onboarding.jsx';
import PinLock from './components/PinLock/PinLock.jsx';
import TodayCard from './components/DailyLesson/TodayCard.jsx';
import DailyLesson from './components/DailyLesson/DailyLesson.jsx';
import MockInterviewCard from './components/MockInterview/MockInterviewCard.jsx';
import MockInterview from './components/MockInterview/MockInterview.jsx';
import VoiceInputBar from './components/UmschulungSimulator/VoiceInputBar.jsx';
import { useGermanStore } from './store/useGermanStore.js';
import { useT } from './utils/i18n.js';
import { useDailyReminder } from './hooks/useDailyReminder.js';

const TAB_KEYS = {
  dashboard: { labelKey: 'nav.dashboard', Icon: DashboardIcon },
  grammar: { labelKey: 'nav.grammar', Icon: GrammarIcon },
  cards: { labelKey: 'nav.cards', Icon: CardsIcon },
  settings: { labelKey: 'nav.settings', Icon: SettingsIcon },
};

// Dashboard — один скроллящийся экран (см. макет: три скриншота — это три
// положения скролла одной страницы), сверху — TodayCard (единственная точка
// входа в пошаговый DailyLesson, привязанный к плану из онбординга — до этого
// план показывался один раз и ни на что не влиял). Grammar/Karten/Settings —
// отдельные полноэкранные модули, переключаются BottomNav, для практики
// сверх плана. VoiceInputBar виден на всех вкладках, зафиксирован снизу
// вместе с BottomNav в общем .bottom-dock.
//
// Перед основным приложением — два возможных гейта (App-уровня, не роуты):
// PinLock (каждый холодный старт, пока не введён верный PIN — см.
// createSettingsSlice.js: один фиксированный PIN, без самостоятельного
// сброса — "не хочу, чтобы кто попало зашёл") и только потом Onboarding
// (один раз, пока !settings.onboardingCompleted).
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lessonOpen, setLessonOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const t = useT();
  const onboardingCompleted = useGermanStore((s) => s.settings.onboardingCompleted);
  const isUnlocked = useGermanStore((s) => s.settings.isUnlocked);
  useDailyReminder();

  if (!isUnlocked) return <PinLock />;
  if (!onboardingCompleted) return <Onboarding />;
  if (lessonOpen) return <DailyLesson onClose={() => setLessonOpen(false)} />;
  if (interviewOpen) return <MockInterview onClose={() => setInterviewOpen(false)} />;

  const tabs = Object.fromEntries(
    Object.entries(TAB_KEYS).map(([key, { labelKey, Icon }]) => [key, { label: t(labelKey), Icon }])
  );

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-app-noise bg-repeat">
      <main className="flex-1 px-4 pb-[calc(theme(spacing.input-bar)+theme(spacing.nav-bar)+1rem)] flex flex-col gap-4">
        <Header />
        {activeTab === 'dashboard' && (
          <>
            <TodayCard onStart={() => setLessonOpen(true)} />
            <DailyB2Briefing />
            <B2SentenceUpgrader />
            <MeinB2Fortschritt />
            <WeakSpotsCard />
            <WeeklyDigestCard />
            <MockInterviewCard onStart={() => setInterviewOpen(true)} />
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
