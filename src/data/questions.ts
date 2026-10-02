/**
 * Onboarding questionnaire (shown once, right after registration).
 * The screen is fully data-driven: to add, remove or reorder a question, edit this list only.
 */

export type Answer = string | string[] | number | null;
/** question id -> answer. `null` = skipped, UNKNOWN = "I don't know". */
export type Answers = Record<string, Answer>;

export const UNKNOWN = 'unknown';

export type QuestionType = 'single' | 'multi' | 'number' | 'date';

export interface Option {
  value: string;
  label: string;
  /** Multi-select only: choosing it clears the other options (e.g. "none of the above"). */
  exclusive?: boolean;
}

export interface Question {
  id: string;
  phase: 1 | 2 | 3 | 4;
  type: QuestionType;
  title: string;
  subtitle?: string;
  /** Small privacy note shown above the question. */
  reassurance?: string;
  options?: Option[];
  // number questions
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  /** Shows an "I don't know" button. */
  allowUnknown?: boolean;
  /** Shows a "Skip" button. Core questions (phases 1-2) can't be skipped. */
  skippable?: boolean;
  /** Question is only asked when this returns true. */
  visibleIf?: (a: Answers) => boolean;
}

export const PHASE_TITLES: Record<1 | 2 | 3 | 4, string> = {
  1: 'الأساسيات',
  2: 'طبيعة دورتك',
  3: 'حالتك الصحية',
  4: 'ماذا تريدين من التطبيق',
};

// If her period hasn't started yet, there is nothing else to ask.
const started = (a: Answers) => a.hasHadPeriod !== 'no';

export const QUESTIONS: Question[] = [
  // ---------- Phase 1: basics ----------
  {
    id: 'hasHadPeriod',
    phase: 1,
    type: 'single',
    title: 'هل نزلت عندك الدورة الشهرية من قبل؟',
    subtitle: 'أسئلة قليلة تساعدنا على فهم دورتك بدقة.',
    options: [
      { value: 'yes', label: 'نعم' },
      { value: 'no', label: 'لا، لم تبدأ بعد' },
      { value: 'unsure', label: 'لا أتذكر' },
    ],
  },
  {
    id: 'firstPeriodAge',
    phase: 1,
    type: 'number',
    title: 'كم كان عمرك عند أول دورة؟',
    min: 8,
    max: 18,
    defaultValue: 12,
    unit: 'سنة',
    allowUnknown: true,
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'lastPeriodStart',
    phase: 1,
    type: 'date',
    title: 'متى بدأت آخر دورة؟',
    subtitle: 'أول يوم نزل فيه الدم.',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'periodLength',
    phase: 1,
    type: 'number',
    title: 'كم يوماً يستمر النزيف عادة؟',
    min: 2,
    max: 10,
    defaultValue: 5,
    unit: 'أيام',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'cycleLength',
    phase: 1,
    type: 'number',
    title: 'كم يوماً بين بداية دورة وبداية التي تليها؟',
    subtitle: 'عدّي من أول يوم في دورة إلى أول يوم في الدورة التالية. الطبيعي بين 21 و35 يوماً.',
    min: 18,
    max: 60,
    defaultValue: 28,
    unit: 'يوماً',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'regularity',
    phase: 1,
    type: 'single',
    title: 'هل دورتك منتظمة؟',
    options: [
      { value: 'always', label: 'دائماً' },
      { value: 'mostly', label: 'غالباً' },
      { value: 'rarely', label: 'نادراً' },
      { value: UNKNOWN, label: 'لا أعرف' },
    ],
    visibleIf: started,
  },

  // ---------- Phase 2: your cycle ----------
  {
    id: 'flow',
    phase: 2,
    type: 'single',
    title: 'كيف تصفين غزارة النزيف؟',
    options: [
      { value: 'light', label: 'خفيف' },
      { value: 'medium', label: 'متوسط' },
      { value: 'heavy', label: 'غزير' },
      { value: 'varies', label: 'يتغير من دورة لأخرى' },
    ],
    visibleIf: started,
  },
  {
    id: 'heavySigns',
    phase: 2,
    type: 'multi',
    title: 'هل تلاحظين أياً مما يلي؟',
    options: [
      { value: 'hourly', label: 'أغيّر الفوطة كل ساعة أو أقل' },
      { value: 'clots', label: 'تظهر جلطات كبيرة' },
      { value: 'none', label: 'لا شيء من ذلك', exclusive: true },
    ],
    skippable: true,
    visibleIf: (a) => started(a) && a.flow === 'heavy',
  },
  {
    id: 'pain',
    phase: 2,
    type: 'single',
    title: 'كيف الألم أثناء الدورة؟',
    options: [
      { value: 'none', label: 'لا يوجد' },
      { value: 'mild', label: 'خفيف' },
      { value: 'moderate', label: 'متوسط' },
      { value: 'severe', label: 'شديد ويمنعني من أنشطتي' },
    ],
    visibleIf: started,
  },
  {
    id: 'pmsSymptoms',
    phase: 2,
    type: 'multi',
    title: 'ما الأعراض التي تلاحظينها قبل الدورة؟',
    subtitle: 'يمكنك اختيار أكثر من إجابة.',
    options: [
      { value: 'bloating', label: 'انتفاخ' },
      { value: 'mood', label: 'تقلب المزاج' },
      { value: 'headache', label: 'صداع' },
      { value: 'acne', label: 'حب الشباب' },
      { value: 'fatigue', label: 'تعب' },
      { value: 'cravings', label: 'رغبة في الطعام' },
      { value: 'breast', label: 'ألم في الثدي' },
      { value: 'none', label: 'لا ألاحظ شيئاً', exclusive: true },
    ],
    visibleIf: started,
  },
  {
    id: 'spotting',
    phase: 2,
    type: 'single',
    title: 'هل يحدث نزيف أو بقع بين الدورات؟',
    options: [
      { value: 'never', label: 'أبداً' },
      { value: 'sometimes', label: 'أحياناً' },
      { value: 'often', label: 'كثيراً' },
    ],
    skippable: true,
    visibleIf: started,
  },

  // ---------- Phase 3: health ----------
  {
    id: 'status',
    phase: 3,
    type: 'multi',
    title: 'ما وضعك الحالي؟',
    subtitle: 'يمكنك اختيار أكثر من إجابة.',
    reassurance: 'هذه الإجابات تبقى على جهازك فقط ولا نرسلها لأحد.',
    options: [
      { value: 'pregnant', label: 'حامل' },
      { value: 'postpartum', label: 'بعد الولادة أو أرضع' },
      { value: 'hormonal', label: 'أستخدم وسيلة هرمونية' },
      { value: 'perimenopause', label: 'أقترب من سن اليأس' },
      { value: 'none', label: 'لا شيء مما سبق', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'diagnosis',
    phase: 3,
    type: 'multi',
    title: 'هل لديك تشخيص طبي؟',
    options: [
      { value: 'pcos', label: 'تكيّس المبايض (PCOS)' },
      { value: 'endometriosis', label: 'بطانة الرحم المهاجرة' },
      { value: 'thyroid', label: 'مشاكل الغدة الدرقية' },
      { value: 'none', label: 'لا شيء', exclusive: true },
      { value: 'private', label: 'أفضّل ألا أقول', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'anemia',
    phase: 3,
    type: 'single',
    title: 'هل عانيتِ من فقر الدم أو نقص الحديد؟',
    subtitle: 'مهم خصوصاً مع النزيف الغزير.',
    options: [
      { value: 'yes', label: 'نعم' },
      { value: 'no', label: 'لا' },
      { value: 'unsure', label: 'لا أعرف' },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'lifestyle',
    phase: 3,
    type: 'multi',
    title: 'هل حدث مؤخراً أي مما يلي؟',
    subtitle: 'هذه الأمور قد تؤخر الدورة، فتفسّر التأخر بدل القلق.',
    options: [
      { value: 'weight', label: 'تغيّر كبير في الوزن' },
      { value: 'exercise', label: 'رياضة شديدة' },
      { value: 'stress', label: 'توتر كبير' },
      { value: 'none', label: 'لا شيء من ذلك', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },

  // ---------- Phase 4: preferences ----------
  {
    id: 'goal',
    phase: 4,
    type: 'single',
    title: 'ما هدفك الأساسي من التطبيق؟',
    options: [
      { value: 'track', label: 'معرفة موعد دورتي فقط' },
      { value: 'symptoms', label: 'فهم أعراضي ومزاجي' },
      { value: 'conceive', label: 'التخطيط للحمل' },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'ramadan',
    phase: 4,
    type: 'single',
    title: 'هل تريدين تتبّع أيام رمضان والتقويم الهجري؟',
    options: [
      { value: 'yes', label: 'نعم' },
      { value: 'no', label: 'لا' },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'reminders',
    phase: 4,
    type: 'single',
    title: 'كيف تفضّلين التذكيرات؟',
    options: [
      { value: 'neutral', label: 'بنص عام محايد (مثل: "تذكير")' },
      { value: 'clear', label: 'بنص واضح' },
      { value: 'off', label: 'بدون تذكيرات' },
    ],
    skippable: true,
  },
];

/** Questions that apply for the given answers, in order. */
export const visibleQuestions = (answers: Answers): Question[] =>
  QUESTIONS.filter((q) => !q.visibleIf || q.visibleIf(answers));
