import type { LanguageCode } from '../languages';

/**
 * Texts for signing in/out and deleting data.
 * 'settings.signOutMessage' replaces the older text, which said the data would be deleted.
 */
export const accountTexts: Record<LanguageCode, Record<string, string>> = {
  en: {
    'account.welcomeBack': 'Welcome back, {name}!',
    'account.welcomeBackAnon': 'Welcome back!',
    'account.welcomeBackHint': 'Your cycle data is saved on this device and is waiting for you.',
    'account.continue': 'Continue',
    'account.notYou': 'Not you? Start a new profile',
    'account.newProfileTitle': 'Start a new profile?',
    'account.newProfileMessage':
      'This permanently deletes the saved profile and all cycle data on this device.',
    'account.newProfileConfirm': 'Delete and start over',
    'settings.signOutMessage':
      'You will be signed out. Your data stays on this device and will be here when you come back.',
    'settings.deleteAll': 'Delete all my data',
    'settings.deleteAllTitle': 'Delete all your data?',
    'settings.deleteAllMessage':
      'Your profile, answers, periods and daily logs will be permanently deleted from this device. This cannot be undone.',
    'settings.deleteAllConfirm': 'Delete everything',
  },
  ar: {
    'account.welcomeBack': 'أهلاً بعودتك يا {name}!',
    'account.welcomeBackAnon': 'أهلاً بعودتك!',
    'account.welcomeBackHint': 'بيانات دورتك محفوظة على هذا الجهاز وبانتظارك.',
    'account.continue': 'متابعة',
    'account.notYou': 'لستِ أنتِ؟ ابدئي ملفاً جديداً',
    'account.newProfileTitle': 'بدء ملف جديد؟',
    'account.newProfileMessage':
      'سيتم حذف الملف الشخصي المحفوظ وكل بيانات الدورة من هذا الجهاز نهائياً.',
    'account.newProfileConfirm': 'احذفي وابدئي من جديد',
    'settings.signOutMessage':
      'سيتم تسجيل خروجك. تبقى بياناتك محفوظة على هذا الجهاز وستجدينها عند عودتك.',
    'settings.deleteAll': 'احذف كل بياناتي',
    'settings.deleteAllTitle': 'حذف كل بياناتك؟',
    'settings.deleteAllMessage':
      'سيتم حذف ملفك الشخصي وإجاباتك وسجل دوراتك وسجلاتك اليومية من هذا الجهاز نهائياً. لا يمكن التراجع عن ذلك.',
    'settings.deleteAllConfirm': 'احذف كل شيء',
  },
  fr: {
    'account.welcomeBack': 'Bon retour, {name} !',
    'account.welcomeBackAnon': 'Bon retour !',
    'account.welcomeBackHint': 'Vos données de cycle sont enregistrées sur cet appareil.',
    'account.continue': 'Continuer',
    'account.notYou': 'Ce n\u2019est pas vous ? Créer un nouveau profil',
    'account.newProfileTitle': 'Créer un nouveau profil ?',
    'account.newProfileMessage':
      'Cela supprime définitivement le profil enregistré et toutes les données de cycle de cet appareil.',
    'account.newProfileConfirm': 'Supprimer et recommencer',
    'settings.signOutMessage':
      'Vous serez déconnectée. Vos données restent sur cet appareil et vous les retrouverez à votre retour.',
    'settings.deleteAll': 'Supprimer toutes mes données',
    'settings.deleteAllTitle': 'Supprimer toutes vos données ?',
    'settings.deleteAllMessage':
      'Votre profil, vos réponses, vos règles et vos notes quotidiennes seront supprimés définitivement de cet appareil. Cette action est irréversible.',
    'settings.deleteAllConfirm': 'Tout supprimer',
  },
  es: {
    'account.welcomeBack': '¡Bienvenida de nuevo, {name}!',
    'account.welcomeBackAnon': '¡Bienvenida de nuevo!',
    'account.welcomeBackHint': 'Los datos de tu ciclo están guardados en este dispositivo.',
    'account.continue': 'Continuar',
    'account.notYou': '¿No eres tú? Crear un perfil nuevo',
    'account.newProfileTitle': '¿Crear un perfil nuevo?',
    'account.newProfileMessage':
      'Esto elimina de forma permanente el perfil guardado y todos los datos del ciclo de este dispositivo.',
    'account.newProfileConfirm': 'Eliminar y empezar de nuevo',
    'settings.signOutMessage':
      'Cerrarás la sesión. Tus datos siguen en este dispositivo y los encontrarás cuando vuelvas.',
    'settings.deleteAll': 'Eliminar todos mis datos',
    'settings.deleteAllTitle': '¿Eliminar todos tus datos?',
    'settings.deleteAllMessage':
      'Tu perfil, respuestas, reglas y registros diarios se eliminarán de forma permanente de este dispositivo. No se puede deshacer.',
    'settings.deleteAllConfirm': 'Eliminar todo',
  },
  de: {
    'account.welcomeBack': 'Willkommen zurück, {name}!',
    'account.welcomeBackAnon': 'Willkommen zurück!',
    'account.welcomeBackHint': 'Deine Zyklusdaten sind auf diesem Gerät gespeichert.',
    'account.continue': 'Weiter',
    'account.notYou': 'Nicht du? Neues Profil anlegen',
    'account.newProfileTitle': 'Neues Profil anlegen?',
    'account.newProfileMessage':
      'Dadurch werden das gespeicherte Profil und alle Zyklusdaten auf diesem Gerät endgültig gelöscht.',
    'account.newProfileConfirm': 'Löschen und neu beginnen',
    'settings.signOutMessage':
      'Du wirst abgemeldet. Deine Daten bleiben auf diesem Gerät und sind da, wenn du zurückkommst.',
    'settings.deleteAll': 'Alle meine Daten löschen',
    'settings.deleteAllTitle': 'Alle Daten löschen?',
    'settings.deleteAllMessage':
      'Dein Profil, deine Antworten, Perioden und Tageseinträge werden endgültig von diesem Gerät gelöscht. Das kann nicht rückgängig gemacht werden.',
    'settings.deleteAllConfirm': 'Alles löschen',
  },
  pt: {
    'account.welcomeBack': 'Bem-vinda de volta, {name}!',
    'account.welcomeBackAnon': 'Bem-vinda de volta!',
    'account.welcomeBackHint': 'Os dados do seu ciclo estão guardados neste dispositivo.',
    'account.continue': 'Continuar',
    'account.notYou': 'Não é você? Criar um novo perfil',
    'account.newProfileTitle': 'Criar um novo perfil?',
    'account.newProfileMessage':
      'Isto elimina permanentemente o perfil guardado e todos os dados do ciclo deste dispositivo.',
    'account.newProfileConfirm': 'Eliminar e recomeçar',
    'settings.signOutMessage':
      'Vai terminar a sessão. Os seus dados ficam neste dispositivo e estarão aqui quando voltar.',
    'settings.deleteAll': 'Eliminar todos os meus dados',
    'settings.deleteAllTitle': 'Eliminar todos os seus dados?',
    'settings.deleteAllMessage':
      'O seu perfil, respostas, menstruações e registos diários serão eliminados permanentemente deste dispositivo. Isto não pode ser desfeito.',
    'settings.deleteAllConfirm': 'Eliminar tudo',
  },
};