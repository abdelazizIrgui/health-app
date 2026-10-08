import type { SplitLanguageCode } from '../languages';

/**
 * Gentle health notes. They are general information, never a diagnosis.
 * 'alerts.longPeriod' has plural forms because its number is 8 or more (Arabic: .few / .other).
 */
export const alertsTexts: Record<SplitLanguageCode, Record<string, string>> = {
  en: {
    'alerts.title': 'A note for you',
    'alerts.shortCycle':
      'Your last cycle was {n} days, which is shorter than the usual 21 to 35 days. If this keeps happening, it is worth mentioning to a doctor.',
    'alerts.longCycle':
      'Your last cycle was {n} days, which is longer than usual (up to {max} days). If this keeps happening, it is worth mentioning to a doctor.',
    'alerts.longPeriod.other':
      'Your last period lasted {n} days, which is longer than the usual 7 days or less. It is a good idea to talk to a doctor.',
    'alerts.heavyFlow':
      'You logged heavy flow on several of the last few days. If you need to change a pad or tampon every hour for several hours, or you feel dizzy or very tired, please see a doctor soon.',
    'alerts.missed':
      'Your period has not come for about 3 months or more. There are many possible causes, including pregnancy, so a test and a doctor’s advice can help.',
    'alerts.footer': 'This is general information, not a diagnosis.',
  },
  ar: {
    'alerts.title': 'ملاحظة لك',
    'alerts.shortCycle':
      'كانت دورتك الأخيرة {n} يوماً، وهذا أقصر من المعتاد (من 21 إلى 35 يوماً). إذا تكرر ذلك فمن الجيد ذكره للطبيبة.',
    'alerts.longCycle':
      'كانت دورتك الأخيرة {n} يوماً، وهذا أطول من المعتاد (حتى {max} يوماً). إذا تكرر ذلك فمن الجيد ذكره للطبيبة.',
    'alerts.longPeriod.few':
      'استمر النزيف في دورتك الأخيرة {n} أيام، وهذا أطول من المعتاد (7 أيام أو أقل). من الجيد استشارة الطبيبة.',
    'alerts.longPeriod.other':
      'استمر النزيف في دورتك الأخيرة {n} يوماً، وهذا أطول من المعتاد (7 أيام أو أقل). من الجيد استشارة الطبيبة.',
    'alerts.heavyFlow':
      'سجّلتِ نزيفاً غزيراً في عدة أيام من الأيام الأخيرة. إذا كنتِ تحتاجين إلى تغيير الفوطة كل ساعة لعدة ساعات، أو شعرتِ بدوار أو إرهاق شديد، فراجعي الطبيبة قريباً.',
    'alerts.missed':
      'لم تأتِ دورتك منذ نحو 3 أشهر أو أكثر. لهذا أسباب كثيرة منها الحمل، فمن المفيد إجراء اختبار واستشارة الطبيبة.',
    'alerts.footer': 'هذه معلومات عامة وليست تشخيصاً.',
  },
  fr: {
    'alerts.title': 'Une note pour vous',
    'alerts.shortCycle':
      'Votre dernier cycle a duré {n} jours, ce qui est plus court que la normale (21 à 35 jours). Si cela se répète, il est utile d’en parler à un médecin.',
    'alerts.longCycle':
      'Votre dernier cycle a duré {n} jours, ce qui est plus long que la normale (jusqu’à {max} jours). Si cela se répète, il est utile d’en parler à un médecin.',
    'alerts.longPeriod.other':
      'Vos dernières règles ont duré {n} jours, ce qui est plus long que la normale (7 jours ou moins). Il est conseillé d’en parler à un médecin.',
    'alerts.heavyFlow':
      'Vous avez noté un flux abondant plusieurs jours récemment. Si vous devez changer de protection toutes les heures pendant plusieurs heures, ou si vous vous sentez étourdie ou très fatiguée, consultez rapidement un médecin.',
    'alerts.missed':
      'Vos règles ne sont pas venues depuis environ 3 mois ou plus. Les causes sont nombreuses, dont la grossesse : un test et l’avis d’un médecin peuvent aider.',
    'alerts.footer': 'Ce sont des informations générales, pas un diagnostic.',
  },
  es: {
    'alerts.title': 'Una nota para ti',
    'alerts.shortCycle':
      'Tu último ciclo duró {n} días, más corto de lo habitual (de 21 a 35 días). Si se repite, conviene comentarlo con un médico.',
    'alerts.longCycle':
      'Tu último ciclo duró {n} días, más largo de lo habitual (hasta {max} días). Si se repite, conviene comentarlo con un médico.',
    'alerts.longPeriod.other':
      'Tu última regla duró {n} días, más de lo habitual (7 días o menos). Es buena idea hablar con un médico.',
    'alerts.heavyFlow':
      'Registraste flujo abundante en varios de los últimos días. Si necesitas cambiar la compresa o el tampón cada hora durante varias horas, o te sientes mareada o muy cansada, consulta pronto a un médico.',
    'alerts.missed':
      'Tu regla no ha llegado desde hace unos 3 meses o más. Hay muchas causas posibles, entre ellas el embarazo, así que una prueba y el consejo de un médico pueden ayudar.',
    'alerts.footer': 'Es información general, no un diagnóstico.',
  },
  de: {
    'alerts.title': 'Ein Hinweis für dich',
    'alerts.shortCycle':
      'Dein letzter Zyklus dauerte {n} Tage und war damit kürzer als üblich (21 bis 35 Tage). Wenn das öfter vorkommt, sprich am besten mit einer Ärztin oder einem Arzt.',
    'alerts.longCycle':
      'Dein letzter Zyklus dauerte {n} Tage und war damit länger als üblich (bis zu {max} Tage). Wenn das öfter vorkommt, sprich am besten mit einer Ärztin oder einem Arzt.',
    'alerts.longPeriod.other':
      'Deine letzte Periode dauerte {n} Tage, länger als üblich (höchstens 7 Tage). Es ist sinnvoll, mit einer Ärztin oder einem Arzt zu sprechen.',
    'alerts.heavyFlow':
      'Du hast an mehreren der letzten Tage eine starke Blutung eingetragen. Wenn du mehrere Stunden lang jede Stunde Binde oder Tampon wechseln musst oder dir schwindlig oder du sehr müde bist, such bald ärztlichen Rat.',
    'alerts.missed':
      'Deine Periode ist seit etwa 3 Monaten oder länger ausgeblieben. Dafür gibt es viele Gründe, auch eine Schwangerschaft; ein Test und ärztlicher Rat können helfen.',
    'alerts.footer': 'Das sind allgemeine Informationen, keine Diagnose.',
  },
  pt: {
    'alerts.title': 'Uma nota para si',
    'alerts.shortCycle':
      'O seu último ciclo durou {n} dias, mais curto do que o habitual (21 a 35 dias). Se isto se repetir, vale a pena falar com um médico.',
    'alerts.longCycle':
      'O seu último ciclo durou {n} dias, mais longo do que o habitual (até {max} dias). Se isto se repetir, vale a pena falar com um médico.',
    'alerts.longPeriod.other':
      'A sua última menstruação durou {n} dias, mais do que o habitual (7 dias ou menos). É boa ideia falar com um médico.',
    'alerts.heavyFlow':
      'Registou fluxo abundante em vários dos últimos dias. Se precisa de trocar o penso ou o tampão todas as horas durante várias horas, ou se sente tonturas ou muito cansaço, consulte um médico em breve.',
    'alerts.missed':
      'A sua menstruação não vem há cerca de 3 meses ou mais. Há muitas causas possíveis, incluindo gravidez, por isso um teste e a opinião de um médico podem ajudar.',
    'alerts.footer': 'São informações gerais, não um diagnóstico.',
  },
};