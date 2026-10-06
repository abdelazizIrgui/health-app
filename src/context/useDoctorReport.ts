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

      const { uri } = await Print.printToFileAsync({ html });

      // Give the file a readable name (the printer makes a random one).
      let shareUri = uri;
      try {
        const target = new File(Paths.cache, `cycle-report-${toIsoDate(new Date())}.pdf`);
        await new File(uri).move(target, { overwrite: true });
        shareUri = target.uri;
      } catch (e) {
        console.warn('Could not rename the report, sharing it as it is', e);
      }

      if (!(await Sharing.isAvailableAsync())) return 'error';
      await Sharing.shareAsync(shareUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: t('report.shareTitle'),
      });
      return 'ok';
    } catch (e) {
      console.warn('Could not create the report', e);
      return 'error';
    }
  };

  return { createAndShare };
}