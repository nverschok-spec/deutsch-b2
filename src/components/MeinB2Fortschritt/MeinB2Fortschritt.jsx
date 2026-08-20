import Card from '../common/Card.jsx';
import CircularProgress from '../common/CircularProgress.jsx';
import LinearProgress from '../common/LinearProgress.jsx';
import { useGermanStore } from '../../store/useGermanStore.js';
import { xpToLevel } from '../../utils/level.js';

// MeinB2Fortschritt — вся статистика реальная, не заглушка:
// кольцо = xpToLevel(progress.xp), полоски = фактические счётчики из стора
// (learnedPhrases.length и накопленные секунды разговора из VoiceInputBar).
const NV_TARGET = 50; // сколько Nomen-Verb-Verbindungen считаем "полным набором" для B1+/B2
const CONVERSATION_TARGET_MIN = 60; // часовая "норма" разговорной практики

export default function MeinB2Fortschritt() {
  const xp = useGermanStore((s) => s.progress.xp);
  const conversationSeconds = useGermanStore((s) => s.progress.conversationSeconds);
  const learnedCount = useGermanStore((s) => s.briefing.learnedPhrases.length);

  const { label, percent } = xpToLevel(xp);
  const conversationMinutes = Math.floor(conversationSeconds / 60);

  return (
    <Card className="animate-slide-up">
      <h2 className="text-lg font-bold text-white mb-4">Mein B2 Fortschritt</h2>

      <div className="flex items-center gap-5">
        <CircularProgress percent={percent} size={128} strokeWidth={11}>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{percent}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Уровень {label}</p>
          </div>
        </CircularProgress>

        <div className="flex-1 flex flex-col gap-4">
          <LinearProgress label="Выученные N-V-Verbindungen" current={learnedCount} target={NV_TARGET} />
          <LinearProgress label="Минуты разговора" current={conversationMinutes} target={CONVERSATION_TARGET_MIN} unit=" мин" />
        </div>
      </div>
    </Card>
  );
}
