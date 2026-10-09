import type { SplitLanguageCode } from '../languages';

/** Texts for exporting a backup and restoring from it. */
export const backupTexts: Record<SplitLanguageCode, Record<string, string>> = {
  en: {
    'settings.export': 'Export my data',
    'settings.exportTitle': 'Export your data?',
    'settings.exportMessage':
      'The backup contains your profile and health data as plain text. Save it somewhere only you can access.',
    'settings.exportConfirm': 'Export',
    'settings.restore': 'Restore from backup',
    'backup.shareTitle': 'Rosy backup',
    'restore.title': 'Restore from backup',
    'restore.hint': 'Paste the backup text you saved earlier, then tap Restore.',
    'restore.placeholder': 'Paste the backup here',
    'restore.button': 'Restore',
    'restore.errInvalid':
      'This does not look like a valid backup. Copy the whole text and try again.',
    'restore.confirmTitle': 'Replace your current data?',
    'restore.confirmMessage':
      'The backup will replace the profile and cycle data that are on this device now.',
    'restore.confirmButton': 'Replace',
    'restore.link': 'I have a backup',
  },
  ar: {
    'settings.export': 'تصدير بياناتي',
    'settings.exportTitle': 'تصدير بياناتك؟',
    'settings.exportMessage':
      'تحتوي النسخة الاحتياطية على ملفك الشخصي وبياناتك الصحية كنص عادي غير مشفّر. احفظيها في مكان لا يصل إليه غيرك.',
    'settings.exportConfirm': 'تصدير',
    'settings.restore': 'استرجاع من نسخة احتياطية',
    'backup.shareTitle': 'نسخة احتياطية لتطبيق Rosy',
    'restore.title': 'استرجاع من نسخة احتياطية',
    'restore.hint': 'الصقي نص النسخة الاحتياطية التي حفظتِها سابقاً، ثم اضغطي استرجاع.',
    'restore.placeholder': 'الصقي النسخة الاحتياطية هنا',
    'restore.button': 'استرجاع',
    'restore.errInvalid': 'هذا النص ليس نسخة احتياطية صالحة. انسخي النص كاملاً وحاولي مرة أخرى.',
    'restore.confirmTitle': 'استبدال بياناتك الحالية؟',
    'restore.confirmMessage':
      'ستحل النسخة الاحتياطية محل الملف الشخصي وبيانات الدورة الموجودة على هذا الجهاز الآن.',
    'restore.confirmButton': 'استبدال',
    'restore.link': 'لدي نسخة احتياطية',
  },
  fr: {
    'settings.export': 'Exporter mes données',
    'settings.exportTitle': 'Exporter vos données ?',
    'settings.exportMessage':
      'La sauvegarde contient votre profil et vos données de santé en texte brut. Gardez-la dans un endroit auquel vous seule avez accès.',
    'settings.exportConfirm': 'Exporter',
    'settings.restore': 'Restaurer une sauvegarde',
    'backup.shareTitle': 'Sauvegarde Rosy',
    'restore.title': 'Restaurer une sauvegarde',
    'restore.hint': 'Collez le texte de la sauvegarde enregistrée plus tôt, puis touchez Restaurer.',
    'restore.placeholder': 'Collez la sauvegarde ici',
    'restore.button': 'Restaurer',
    'restore.errInvalid':
      'Ce texte ne ressemble pas à une sauvegarde valide. Copiez le texte en entier et réessayez.',
    'restore.confirmTitle': 'Remplacer vos données actuelles ?',
    'restore.confirmMessage':
      'La sauvegarde remplacera le profil et les données de cycle présents sur cet appareil.',
    'restore.confirmButton': 'Remplacer',
    'restore.link': "J'ai une sauvegarde",
  },
  es: {
    'settings.export': 'Exportar mis datos',
    'settings.exportTitle': '¿Exportar tus datos?',
    'settings.exportMessage':
      'La copia de seguridad contiene tu perfil y tus datos de salud en texto sin cifrar. Guárdala donde solo tú puedas acceder.',
    'settings.exportConfirm': 'Exportar',
    'settings.restore': 'Restaurar una copia de seguridad',
    'backup.shareTitle': 'Copia de seguridad de Rosy',
    'restore.title': 'Restaurar una copia de seguridad',
    'restore.hint': 'Pega el texto de la copia que guardaste antes y toca Restaurar.',
    'restore.placeholder': 'Pega aquí la copia de seguridad',
    'restore.button': 'Restaurar',
    'restore.errInvalid':
      'Este texto no parece una copia de seguridad válida. Copia el texto completo e inténtalo de nuevo.',
    'restore.confirmTitle': '¿Reemplazar tus datos actuales?',
    'restore.confirmMessage':
      'La copia reemplazará el perfil y los datos del ciclo que hay ahora en este dispositivo.',
    'restore.confirmButton': 'Reemplazar',
    'restore.link': 'Tengo una copia de seguridad',
  },
  de: {
    'settings.export': 'Meine Daten exportieren',
    'settings.exportTitle': 'Daten exportieren?',
    'settings.exportMessage':
      'Die Sicherung enthält dein Profil und deine Gesundheitsdaten als Klartext. Bewahre sie an einem Ort auf, auf den nur du Zugriff hast.',
    'settings.exportConfirm': 'Exportieren',
    'settings.restore': 'Aus Sicherung wiederherstellen',
    'backup.shareTitle': 'Rosy-Sicherung',
    'restore.title': 'Aus Sicherung wiederherstellen',
    'restore.hint': 'Füge den zuvor gespeicherten Sicherungstext ein und tippe auf Wiederherstellen.',
    'restore.placeholder': 'Sicherung hier einfügen',
    'restore.button': 'Wiederherstellen',
    'restore.errInvalid':
      'Das sieht nicht nach einer gültigen Sicherung aus. Kopiere den gesamten Text und versuche es erneut.',
    'restore.confirmTitle': 'Aktuelle Daten ersetzen?',
    'restore.confirmMessage':
      'Die Sicherung ersetzt das Profil und die Zyklusdaten, die jetzt auf diesem Gerät sind.',
    'restore.confirmButton': 'Ersetzen',
    'restore.link': 'Ich habe eine Sicherung',
  },
  pt: {
    'settings.export': 'Exportar os meus dados',
    'settings.exportTitle': 'Exportar os seus dados?',
    'settings.exportMessage':
      'A cópia de segurança contém o seu perfil e dados de saúde em texto simples. Guarde-a num local a que só você tenha acesso.',
    'settings.exportConfirm': 'Exportar',
    'settings.restore': 'Restaurar cópia de segurança',
    'backup.shareTitle': 'Cópia de segurança do Rosy',
    'restore.title': 'Restaurar cópia de segurança',
    'restore.hint': 'Cole o texto da cópia que guardou antes e toque em Restaurar.',
    'restore.placeholder': 'Cole aqui a cópia de segurança',
    'restore.button': 'Restaurar',
    'restore.errInvalid':
      'Este texto não parece uma cópia de segurança válida. Copie o texto completo e tente novamente.',
    'restore.confirmTitle': 'Substituir os seus dados atuais?',
    'restore.confirmMessage':
      'A cópia vai substituir o perfil e os dados do ciclo que estão agora neste dispositivo.',
    'restore.confirmButton': 'Substituir',
    'restore.link': 'Tenho uma cópia de seguridade',
  },
};