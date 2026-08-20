import SparkleIcon from '../common/SparkleIcon.jsx';
import { useT } from '../../utils/i18n.js';
import PinSetupForm from './PinSetupForm.jsx';

// Показывается в App.jsx на самом первом запуске, до онбординга и дашборда —
// когда settings.pinHash ещё не задан. Без onCancel: приложение не открыть,
// пока не установлен PIN (см. запрос "не хочу, чтобы кто попало зашёл").
export default function MandatoryPinSetup() {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg-deep px-6">
      <SparkleIcon size={56} />
      <div className="w-full max-w-xs flex flex-col gap-3">
        <h1 className="text-center text-xl font-bold text-white">{t('pin.setupTitle')}</h1>
        <p className="text-center text-sm text-slate-400 mb-1">{t('pin.setupSubtitle')}</p>
        <PinSetupForm onDone={() => {}} />
      </div>
    </div>
  );
}
