import { isLanguageCode } from '../i18n/languages';
import { useI18n } from '../i18n/I18nContext';
import { buildBackup, parseBackup } from '../utils/backup';
import { useCycle } from './CycleContext';
import { useUser } from './UserContext';

/** Export everything as text, and put it back from that text. */
export function useBackup() {
  const { user, answers, onboardingDone, restoreUser } = useUser();
  const { periods, logs, restoreCycle } = useCycle();
  const { setLanguage } = useI18n();

  /** The backup text, or null when there is no profile to export. */
  const exportText = (): string | null => {
    if (!user) return null;
    return buildBackup({ user, answers, onboardingDone, periods, logs });
  };

  /** Returns false (and changes nothing) when the text is not a valid backup. */
  const restoreFromText = async (text: string): Promise<boolean> => {
    const backup = parseBackup(text);
    if (!backup) return false;
    await restoreCycle(backup.periods, backup.logs);
    if (isLanguageCode(backup.user.language)) await setLanguage(backup.user.language);
    await restoreUser(backup.user, backup.answers, backup.onboardingDone);
    return true;
  };

  return { exportText, restoreFromText, hasProfile: !!user };
}