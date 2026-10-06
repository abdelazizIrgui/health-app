import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { useI18n } from '../i18n/I18nContext';
import { getCycleProfile } from '../utils/cycleFromAnswers';
import { toIsoDate } from '../utils/forecast';
import { buildReportData, buildReportHtml } from '../utils/report';
import { useCycle } from './CycleContext';
import { useUser } from './UserContext';

export type ReportResult = 'ok' | 'error';

/** Makes the PDF for the doctor on the device and opens the share sheet. Nothing is uploaded. */
export function useDoctorReport() {
  const { user, answers } = useUser();
  const { periods, logs } = useCycle();
  const { t, formatDate, language, isRTL } = useI18n();

  const createAndShare = async (): Promise<ReportResult> => {
    if (!user) return 'error';
    // Remembers which step is running, so the warning says where it failed.
    let step = 'prepare';
    try {
      const profile = getCycleProfile(answers);
      const data = buildReportData({
        name: user.name,
        birthDate: user.birthDate,
        periods,
        logs,
        seed: profile.ready ? profile.settings : null,
        paused: !profile.ready && profile.reason === 'pregnant',
      });
      const html = buildReportHtml(data, { t, formatDate, language, rtl: isRTL });

      step = 'print';
      const { uri } = await Print.printToFileAsync({ html });

      // Give the file a readable name (the printer makes a random one).
      step = 'rename';
      let shareUri = uri;
      try {
        const target = new File(Paths.cache, `cycle-report-${toIsoDate(new Date())}.pdf`);
        if (target.exists) target.delete();
        new File(uri).move(target);
        shareUri = target.uri;
      } catch (e) {
        console.warn('Could not rename the report, sharing it as it is', e);
      }

      step = 'check-share';
      if (!(await Sharing.isAvailableAsync())) {
        console.warn('Report failed at step: sharing is not available on this device');
        return 'error';
      }

      // Try the renamed file first, then the original one, with the options and then without.
      step = 'share';
      const options = {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: t('report.shareTitle'),
      };
      const attempts: { file: string; withOptions: boolean }[] = [
        { file: shareUri, withOptions: true },
        { file: shareUri, withOptions: false },
      ];
      if (shareUri !== uri) {
        attempts.push({ file: uri, withOptions: true }, { file: uri, withOptions: false });
      }
      let lastError: unknown = null;
      for (const attempt of attempts) {
        try {
          if (attempt.withOptions) await Sharing.shareAsync(attempt.file, options);
          else await Sharing.shareAsync(attempt.file);
          return 'ok';
        } catch (e) {
          lastError = e;
        }
      }
      throw lastError;
    } catch (e) {
      console.warn(`Report failed at step: ${step}.`, e);
      return 'error';
    }
  };

  return { createAndShare };
}