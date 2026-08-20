import { useEffect, useState } from 'react';
import SparkleIcon from '../common/SparkleIcon.jsx';
import Card from '../common/Card.jsx';
import Spinner from '../common/Spinner.jsx';
import { PrimaryButton } from '../common/Button.jsx';
import { askClaude } from '../../api/claude.js';
import { useGermanStore } from '../../store/useGermanStore.js';
import { useT } from '../../utils/i18n.js';

const STEPS = ['word', 'upgrade', 'dialogue', 'done'];
const inputClass =
  'w-full rounded-2xl bg-surface-raised/60 border border-surface-border px-4 py-3 ' +
  'text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/40';

// Полноэкранный пошаговый урок дня — единственное, что реально связывает
// план из онбординга (utils/plan.js, показанный один раз) с ежедневной
// практикой. Три коротких шага, переиспользующие уже существующие AI-задачи
// (dailyBriefing/upgradeSentence/dialogueTurn) — без них план был мёртвым
// текстом, который ни на что не влиял (см. фидбэк "что и как непонятно").
export default function DailyLesson({ onClose }) {
  const t = useT();
  const settings = useGermanStore((s) => s.settings);
  const briefing = useGermanStore((s) => s.briefing);
  const setBriefing = useGermanStore((s) => s.briefing.setBriefing);
  const addXp = useGermanStore((s) => s.progress.addXp);
  const markCompletedToday = useGermanStore((s) => s.lesson.markCompletedToday);

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const [wordStatus, setWordStatus] = useState('idle');
  function loadWord() {
    setWordStatus('loading');
    askClaude('dailyBriefing', {})
      .then((data) => {
        setBriefing(data);
        setWordStatus('idle');
      })
      .catch(() => setWordStatus('error'));
  }
  useEffect(() => {
    if (step === 'word' && !briefing.isFresh()) loadWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const [sentence, setSentence] = useState('');
  const [upgradeResult, setUpgradeResult] = useState(null);
  const [upgradeStatus, setUpgradeStatus] = useState('idle');
  async function handleUpgrade() {
    if (!sentence.trim()) return;
    setUpgradeStatus('loading');
    try {
      const data = await askClaude('upgradeSentence', { sentence: sentence.trim() });
      setUpgradeResult(data);
      setUpgradeStatus('idle');
    } catch {
      setUpgradeStatus('error');
    }
  }

  const [dialogueText, setDialogueText] = useState('');
  const [dialogueReply, setDialogueReply] = useState(null);
  const [dialogueStatus, setDialogueStatus] = useState('idle');
  async function handleDialogue() {
    if (!dialogueText.trim()) return;
    setDialogueStatus('loading');
    try {
      const data = await askClaude('dialogueTurn', {
        scenario: settings.dialogueScenario,
        difficulty: settings.difficulty,
        userTurn: dialogueText.trim(),
      });
      setDialogueReply(data);
      setDialogueStatus('idle');
    } catch {
      setDialogueStatus('error');
    }
  }

  function handleFinish() {
    markCompletedToday();
    addXp(10, 'lesson');
    setStepIndex(STEPS.indexOf('done'));
  }

  const nv = briefing.data?.nvVerbindung;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-deep px-4 py-6 overflow-y-auto">
      <div className="mx-auto w-full max-w-sm flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <SparkleIcon size={40} />
          {step !== 'done' && (
            <p className="text-xs text-slate-500">
              {t('today.step')} {stepIndex + 1}/3
            </p>
          )}
          <button onClick={onClose} className="text-xs text-slate-500 underline">
            {t('today.close')}
          </button>
        </div>

        {step === 'word' && (
          <Card className="flex-1 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">{t('today.step1.title')}</h2>
            <p className="text-sm text-slate-400">{t('today.step1.hint')}</p>
            {wordStatus === 'loading' && <Spinner label={t('briefing.loading')} />}
            {wordStatus === 'error' && (
              <button onClick={loadWord} className="text-sm text-rose-400 underline text-left">
                {t('briefing.retry')}
              </button>
            )}
            {nv && (
              <div className="mt-2">
                <p className="term-glow text-2xl">{nv.phrase}</p>
                <p className="text-sm text-slate-300 mt-2">{nv.example}</p>
                <p className="text-sm text-slate-400 mt-1">{nv.meaningRu}</p>
              </div>
            )}
            <PrimaryButton onClick={() => setStepIndex(1)} disabled={!nv} className="mt-auto">
              {t('today.next')}
            </PrimaryButton>
          </Card>
        )}

        {step === 'upgrade' && (
          <Card className="flex-1 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">{t('today.step2.title')}</h2>
            <p className="text-sm text-slate-400">{t('today.step2.hint')}</p>
            <input
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpgrade()}
              placeholder={t('today.step2.placeholder')}
              className={inputClass}
            />
            <PrimaryButton onClick={handleUpgrade} disabled={upgradeStatus === 'loading' || !sentence.trim()}>
              {upgradeStatus === 'loading' ? <Spinner label={t('upgrader.analyzing')} /> : t('today.step2.upgrade')}
            </PrimaryButton>
            {upgradeStatus === 'error' && <p className="text-sm text-rose-400">{t('upgrader.error')}</p>}
            {upgradeResult && (
              <div className="rounded-2xl bg-surface-raised/50 px-3 py-2.5">
                <p className="term-glow">{upgradeResult.upgraded}</p>
              </div>
            )}
            <PrimaryButton onClick={() => setStepIndex(2)} disabled={!upgradeResult} className="mt-auto">
              {t('today.next')}
            </PrimaryButton>
          </Card>
        )}

        {step === 'dialogue' && (
          <Card className="flex-1 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">{t('today.step3.title')}</h2>
            <p className="text-sm text-slate-400">{t('today.step3.hint')}</p>
            <input
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDialogue()}
              placeholder={t('today.step3.placeholder')}
              className={inputClass}
            />
            <PrimaryButton onClick={handleDialogue} disabled={dialogueStatus === 'loading' || !dialogueText.trim()}>
              {dialogueStatus === 'loading' ? <Spinner label={t('voicebar.thinking')} /> : t('today.step3.send')}
            </PrimaryButton>
            {dialogueStatus === 'error' && <p className="text-sm text-rose-400">{t('voicebar.error')}</p>}
            {dialogueReply && (
              <div className="rounded-2xl bg-surface-raised/50 px-3 py-2.5">
                <p className="text-sm text-slate-200">{dialogueReply.reply}</p>
                {dialogueReply.correction && <p className="text-xs text-amber-400 mt-1">✏️ {dialogueReply.correction}</p>}
              </div>
            )}
            <PrimaryButton onClick={handleFinish} disabled={!dialogueReply} className="mt-auto">
              {t('today.finish')}
            </PrimaryButton>
          </Card>
        )}

        {step === 'done' && (
          <Card className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-xl font-bold text-white">{t('today.step4.title')}</h2>
            <p className="text-sm text-slate-400">{t('today.step4.hint')}</p>
            <PrimaryButton onClick={onClose} className="w-full mt-4">
              {t('today.close')}
            </PrimaryButton>
          </Card>
        )}
      </div>
    </div>
  );
}
