/**
 * English is the reference language: every other file must have exactly the same keys
 * (TypeScript enforces this through the `Dictionary` type).
 *
 * Placeholders look like {name}. Plural texts use the suffixes .one / .other
 * (Arabic also uses .two and .few).
 */
export const en = {
  // ---- common ----
  'common.next': 'Next',
  'common.finish': 'Finish',
  'common.back': 'Back',
  'common.skip': 'Skip',
  'common.unknown': "I don't know",
  'common.done': 'Done',
  'common.cancel': 'Cancel',

  // ---- welcome ----
  'welcome.hello': 'Hello',
  'welcome.subtitle': 'Welcome to your cycle companion',

  // ---- register ----
  'register.title': 'Create your account',
  'register.subtitle': 'Set up your profile to start tracking your cycle.',
  'register.language': 'Language',
  'register.name': 'Name',
  'register.namePlaceholder': 'Your name',
  'register.email': 'Email',
  'register.phone': 'Phone number',
  'register.birth': 'Birth date',
  'register.birthPlaceholder': 'Select your birth date',
  'register.password': 'Password',
  'register.passwordPlaceholder': 'At least 8 characters',
  'register.showPassword': 'Show password',
  'register.hidePassword': 'Hide password',
  'register.submit': 'Create account',
  'register.note': 'Your health data stays on this device.',
  'register.errName': 'Enter your name',
  'register.errEmail': 'Enter a valid email address',
  'register.errPhone': 'Enter a valid phone number',
  'register.errBirth': 'Select your birth date',
  'register.errPassword': 'Use at least 8 characters',
  'register.errSave': 'Could not save your account. Please try again.',

  // ---- tabs ----
  'tabs.home': 'Home',
  'tabs.calendar': 'Calendar',
  'tabs.insights': 'Insights',
  'tabs.settings': 'Settings',

  // ---- home ----
  'home.greeting': 'Hello, {name}!',
  'home.greetingAnon': 'Hello there!',
  'home.mode': 'Cycle tracking',
  'home.day': 'Day',
  'home.dayOf': 'of {n}',
  'home.waiting.not_started': "We'll show your cycle predictions here once your first period starts.",
  'home.waiting.pregnant': 'Cycle predictions are paused during pregnancy.',
  'home.waiting.no_date': 'Log the start date of your last period and we will show your predictions.',
  'home.quickLog': 'Quick log',
  'home.logFlow': 'Log flow',
  'home.logSymptoms': 'Log symptoms',
  'home.logMood': 'Log mood',
  'home.periodDay': 'Period day {day}',
  'home.fertile': 'Fertile window (estimate)',
  'home.periodIn.one': 'Period expected in {n} day',
  'home.periodIn.other': 'Period expected in {n} days',
  'phase.menstrual': 'Menstrual phase',
  'phase.follicular': 'Follicular phase',
  'phase.fertile': 'Ovulation phase',
  'phase.luteal': 'Luteal phase',

  // ---- placeholders ----
  'calendar.title': 'Calendar',
  'calendar.hint': 'Your cycle calendar will appear here.',
  'insights.title': 'Insights',
  'insights.hint': 'Trends and patterns will appear here.',

  // ---- settings ----
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.signOut': 'Sign out',
  'settings.signOutTitle': 'Sign out?',
  'settings.signOutMessage': 'Your profile and answers will be removed from this device.',

  // ---- onboarding (screen) ----
  'onb.phase': '{n} of 4 · {title}',
  'onb.phase.1': 'The basics',
  'onb.phase.2': 'Your cycle',
  'onb.phase.3': 'Your health',
  'onb.phase.4': 'Your preferences',
  'onb.privacy': 'These answers stay on your device and are never sent to anyone.',
  'onb.decrease': 'Decrease',
  'onb.increase': 'Increase',
  'onb.today': 'Today',
  'onb.yesterday': 'Yesterday',
  'onb.weekAgo': 'A week ago',
  'onb.otherDate': 'Pick another date',
  'unit.years': 'years old',
  'unit.days': 'days',

  // ---- onboarding (questions) ----
  'q.hasHadPeriod.title': 'Have you ever had a period?',
  'q.hasHadPeriod.subtitle': 'A few short questions help us understand your cycle.',
  'q.hasHadPeriod.o.yes': 'Yes',
  'q.hasHadPeriod.o.no': 'No, not yet',
  'q.hasHadPeriod.o.unsure': "I don't remember",

  'q.firstPeriodAge.title': 'How old were you at your first period?',

  'q.lastPeriodStart.title': 'When did your last period start?',
  'q.lastPeriodStart.subtitle': 'The first day you had bleeding.',

  'q.periodLength.title': 'How many days does your bleeding usually last?',

  'q.cycleLength.title': 'How many days are there between the start of one period and the next?',
  'q.cycleLength.subtitle':
    'Count from the first day of one period to the first day of the next. A typical cycle is 21 to 35 days.',

  'q.regularity.title': 'Is your cycle regular?',
  'q.regularity.o.always': 'Always',
  'q.regularity.o.mostly': 'Mostly',
  'q.regularity.o.rarely': 'Rarely',
  'q.regularity.o.unknown': "I don't know",

  'q.flow.title': 'How would you describe your flow?',
  'q.flow.o.light': 'Light',
  'q.flow.o.medium': 'Medium',
  'q.flow.o.heavy': 'Heavy',
  'q.flow.o.varies': 'It changes from cycle to cycle',

  'q.heavySigns.title': 'Do you notice any of these?',
  'q.heavySigns.o.hourly': 'I change my pad or tampon every hour or more often',
  'q.heavySigns.o.clots': 'I pass large clots',
  'q.heavySigns.o.none': 'None of these',

  'q.pain.title': 'How is the pain during your period?',
  'q.pain.o.none': 'No pain',
  'q.pain.o.mild': 'Mild',
  'q.pain.o.moderate': 'Moderate',
  'q.pain.o.severe': 'Severe, it stops me from doing my activities',

  'q.pmsSymptoms.title': 'Which symptoms do you notice before your period?',
  'q.pmsSymptoms.subtitle': 'You can choose more than one.',
  'q.pmsSymptoms.o.bloating': 'Bloating',
  'q.pmsSymptoms.o.mood': 'Mood swings',
  'q.pmsSymptoms.o.headache': 'Headache',
  'q.pmsSymptoms.o.acne': 'Acne',
  'q.pmsSymptoms.o.fatigue': 'Tiredness',
  'q.pmsSymptoms.o.cravings': 'Food cravings',
  'q.pmsSymptoms.o.breast': 'Breast tenderness',
  'q.pmsSymptoms.o.none': 'I notice nothing',

  'q.spotting.title': 'Do you have bleeding or spotting between periods?',
  'q.spotting.o.never': 'Never',
  'q.spotting.o.sometimes': 'Sometimes',
  'q.spotting.o.often': 'Often',

  'q.status.title': 'What is your current situation?',
  'q.status.subtitle': 'You can choose more than one.',
  'q.status.o.pregnant': 'Pregnant',
  'q.status.o.postpartum': 'After giving birth or breastfeeding',
  'q.status.o.hormonal': 'Using hormonal contraception',
  'q.status.o.perimenopause': 'Approaching menopause',
  'q.status.o.none': 'None of these',

  'q.diagnosis.title': 'Do you have a medical diagnosis?',
  'q.diagnosis.o.pcos': 'Polycystic ovary syndrome (PCOS)',
  'q.diagnosis.o.endometriosis': 'Endometriosis',
  'q.diagnosis.o.thyroid': 'Thyroid problems',
  'q.diagnosis.o.none': 'None',
  'q.diagnosis.o.private': 'I prefer not to say',

  'q.anemia.title': 'Have you had anemia or low iron?',
  'q.anemia.subtitle': 'This matters especially with heavy bleeding.',
  'q.anemia.o.yes': 'Yes',
  'q.anemia.o.no': 'No',
  'q.anemia.o.unsure': "I don't know",

  'q.lifestyle.title': 'Has any of this happened recently?',
  'q.lifestyle.subtitle': 'These can delay a period, so we can explain a late one instead of worrying you.',
  'q.lifestyle.o.weight': 'A big change in weight',
  'q.lifestyle.o.exercise': 'Intense exercise',
  'q.lifestyle.o.stress': 'A lot of stress',
  'q.lifestyle.o.none': 'None of these',

  'q.goal.title': 'What is your main goal with the app?',
  'q.goal.o.track': 'Just know when my period comes',
  'q.goal.o.symptoms': 'Understand my symptoms and mood',
  'q.goal.o.conceive': 'Plan a pregnancy',

 

  'q.reminders.title': 'How would you like reminders?',
  'q.reminders.o.neutral': 'With a neutral text (like "Reminder")',
  'q.reminders.o.clear': 'With a clear text',
  'q.reminders.o.off': 'No reminders',
};

/** Same keys as English; extra plural keys (e.g. Arabic ".two") are allowed. */
export type Dictionary = Record<keyof typeof en, string> & Partial<Record<string, string>>;