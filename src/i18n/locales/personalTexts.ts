import type { LanguageCode } from '../languages';

/**
 * Notes on the Home screen that come from the questionnaire answers.
 * {list} is replaced by the names of her own answers, for example "Bloating · Headache".
 * This file has all 8 languages (Chinese and Russian too), see I18nContext.tsx.
 */
export const personalTexts: Record<LanguageCode, Record<string, string>> = {
  en: {
    'personal.hormonalNote':
      'You use hormonal contraception, so ovulation can be suppressed or unpredictable. We do not show a fertile window.',
    'personal.lateReasons': 'Things you told us about that can delay a period: {list}.',
    'personal.pmsHeadsUp': 'Your period is close. You usually get: {list}.',
  },
  ar: {
    'personal.hormonalNote':
      'تستخدمين وسيلة هرمونية لمنع الحمل، وقد تتأثر الإباضة أو يصعب توقعها، لذلك لا نعرض فترة الخصوبة.',
    'personal.lateReasons': 'أمور ذكرتِها قد تؤخر الدورة: {list}.',
    'personal.pmsHeadsUp': 'دورتك قريبة. عادةً تلاحظين: {list}.',
  },
  fr: {
    'personal.hormonalNote':
      "Tu utilises une contraception hormonale : l'ovulation peut être bloquée ou imprévisible, donc nous n'affichons pas de fenêtre de fertilité.",
    'personal.lateReasons': 'Ce que tu nous as indiqué peut retarder tes règles : {list}.',
    'personal.pmsHeadsUp': 'Tes règles approchent. Tu ressens souvent : {list}.',
  },
  es: {
    'personal.hormonalNote':
      'Usas anticoncepción hormonal, así que la ovulación puede estar frenada o ser impredecible. No mostramos la ventana fértil.',
    'personal.lateReasons': 'Lo que nos contaste puede retrasar tu regla: {list}.',
    'personal.pmsHeadsUp': 'Tu regla está cerca. Sueles notar: {list}.',
  },
  de: {
    'personal.hormonalNote':
      'Du verhütest hormonell, deshalb kann der Eisprung unterdrückt oder unvorhersehbar sein. Wir zeigen kein fruchtbares Fenster an.',
    'personal.lateReasons': 'Das, was du angegeben hast, kann deine Periode verzögern: {list}.',
    'personal.pmsHeadsUp': 'Deine Periode kommt bald. Typisch für dich sind: {list}.',
  },
  pt: {
    'personal.hormonalNote':
      'Usas contraceção hormonal, por isso a ovulação pode estar suprimida ou ser imprevisível. Não mostramos a janela fértil.',
    'personal.lateReasons': 'O que nos indicaste pode atrasar a menstruação: {list}.',
    'personal.pmsHeadsUp': 'A tua menstruação está a chegar. Costumas ter: {list}.',
  },
  zh: {
    'personal.hormonalNote':
      '你正在使用激素类避孕方式，排卵可能被抑制或难以预测，所以我们不显示易孕期。',
    'personal.lateReasons': '你提到的这些情况可能会让月经推迟：{list}。',
    'personal.pmsHeadsUp': '月经快到了。你通常会出现：{list}。',
  },
  ru: {
    'personal.hormonalNote':
      'Ты используешь гормональную контрацепцию, поэтому овуляция может подавляться или быть непредсказуемой. Мы не показываем фертильное окно.',
    'personal.lateReasons': 'То, о чём ты рассказала, может задерживать месячные: {list}.',
    'personal.pmsHeadsUp': 'Месячные скоро. Обычно у тебя бывает: {list}.',
  },
};