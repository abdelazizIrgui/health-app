/**
 * Onboarding questionnaire (shown once, right after registration).
 * This file holds only the structure (ids, types, options, branching).
 * All texts live in src/i18n/locales/*.ts under these keys:
 *   q.<id>.title        q.<id>.subtitle (optional)        q.<id>.o.<optionValue>
 * To add a question: add it here AND add its texts in every language file.
 */

export type Answer = string | string[] | number | null;
/** question id -> answer. `null` = skipped, UNKNOWN = "I don't know". */
export type Answers = Record<string, Answer>;

export const UNKNOWN = 'unknown';

export type QuestionType = 'single' | 'multi' | 'number' | 'date';

export interface Option {
  value: string;
  /** Multi-select only: choosing it clears the other options (e.g. "none of the above"). */
  exclusive?: boolean;
}

export interface Question {
  id: string;
  phase: 1 | 2 | 3 | 4;
  type: QuestionType;
  /** Shows the small privacy note above the question. */
  reassurance?: boolean;
  options?: Option[];
  // number questions
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: 'years' | 'days';
  /** Shows an "I don't know" button. */
  allowUnknown?: boolean;
  /** Shows a "Skip" button. Core questions (phases 1-2) can't be skipped. */
  skippable?: boolean;
  /** Question is only asked when this returns true. */
  visibleIf?: (a: Answers) => boolean;
}

// If her period hasn't started yet, there is nothing else to ask.
const started = (a: Answers) => a.hasHadPeriod !== 'no';

export const QUESTIONS: Question[] = [
  // ---------- Phase 1: basics ----------
  {
    id: 'hasHadPeriod',
    phase: 1,
    type: 'single',
    options: [{ value: 'yes' }, { value: 'no' }, { value: 'unsure' }],
  },
  {
    id: 'firstPeriodAge',
    phase: 1,
    type: 'number',
    min: 8,
    max: 18,
    defaultValue: 12,
    unit: 'years',
    allowUnknown: true,
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'lastPeriodStart',
    phase: 1,
    type: 'date',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'periodLength',
    phase: 1,
    type: 'number',
    min: 2,
    max: 10,
    defaultValue: 5,
    unit: 'days',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'cycleLength',
    phase: 1,
    type: 'number',
    min: 18,
    max: 60,
    defaultValue: 28,
    unit: 'days',
    allowUnknown: true,
    visibleIf: started,
  },
  {
    id: 'regularity',
    phase: 1,
    type: 'single',
    options: [{ value: 'always' }, { value: 'mostly' }, { value: 'rarely' }, { value: UNKNOWN }],
    visibleIf: started,
  },

  // ---------- Phase 2: your cycle ----------
  {
    id: 'flow',
    phase: 2,
    type: 'single',
    options: [{ value: 'light' }, { value: 'medium' }, { value: 'heavy' }, { value: 'varies' }],
    visibleIf: started,
  },
  {
    id: 'heavySigns',
    phase: 2,
    type: 'multi',
    options: [{ value: 'hourly' }, { value: 'clots' }, { value: 'none', exclusive: true }],
    skippable: true,
    visibleIf: (a) => started(a) && a.flow === 'heavy',
  },
  {
    id: 'pain',
    phase: 2,
    type: 'single',
    options: [{ value: 'none' }, { value: 'mild' }, { value: 'moderate' }, { value: 'severe' }],
    visibleIf: started,
  },
  {
    id: 'pmsSymptoms',
    phase: 2,
    type: 'multi',
    options: [
      { value: 'bloating' },
      { value: 'mood' },
      { value: 'headache' },
      { value: 'acne' },
      { value: 'fatigue' },
      { value: 'cravings' },
      { value: 'breast' },
      { value: 'none', exclusive: true },
    ],
    visibleIf: started,
  },
  {
    id: 'spotting',
    phase: 2,
    type: 'single',
    options: [{ value: 'never' }, { value: 'sometimes' }, { value: 'often' }],
    skippable: true,
    visibleIf: started,
  },

  // ---------- Phase 3: health ----------
  {
    id: 'status',
    phase: 3,
    type: 'multi',
    reassurance: true,
    options: [
      { value: 'pregnant' },
      { value: 'postpartum' },
      { value: 'hormonal' },
      { value: 'perimenopause' },
      { value: 'none', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'diagnosis',
    phase: 3,
    type: 'multi',
    options: [
      { value: 'pcos' },
      { value: 'endometriosis' },
      { value: 'thyroid' },
      { value: 'none', exclusive: true },
      { value: 'private', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'anemia',
    phase: 3,
    type: 'single',
    options: [{ value: 'yes' }, { value: 'no' }, { value: 'unsure' }],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'lifestyle',
    phase: 3,
    type: 'multi',
    options: [
      { value: 'weight' },
      { value: 'exercise' },
      { value: 'stress' },
      { value: 'none', exclusive: true },
    ],
    skippable: true,
    visibleIf: started,
  },

  // ---------- Phase 4: preferences ----------
  {
    id: 'goal',
    phase: 4,
    type: 'single',
    options: [{ value: 'track' }, { value: 'symptoms' }, { value: 'conceive' }],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'ramadan',
    phase: 4,
    type: 'single',
    options: [{ value: 'yes' }, { value: 'no' }],
    skippable: true,
    visibleIf: started,
  },
  {
    id: 'reminders',
    phase: 4,
    type: 'single',
    options: [{ value: 'neutral' }, { value: 'clear' }, { value: 'off' }],
    skippable: true,
  },
];

/** Questions that apply for the given answers, in order. */
export const visibleQuestions = (answers: Answers): Question[] =>
  QUESTIONS.filter((q) => !q.visibleIf || q.visibleIf(answers));