# Rosy

Period (menstrual cycle) tracking app built with Expo, React Native and TypeScript.
All data stays on the device. There is no server, no analytics and no account is sent anywhere.

## Run

    npm install
    npx expo start

Scan the QR code with Expo Go, or press `a` (Android emulator) / `i` (iOS simulator).
Reminders and fingerprint / face unlock need a development build; Expo Go supports them only in part.

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm start`         | Starts Expo                                    |
| `npm run typecheck` | Checks the TypeScript types                    |
| `npm test`          | Runs the unit tests (`src/**/*.test.ts`)       |
| `npm run format`    | Formats the code with Prettier                 |
| `npm run doctor`    | Runs `expo-doctor` to check the project setup  |

## User flow

    Welcome  ->  Register  ->  Onboarding (questions)  ->  Main (tabs)

- First launch: Welcome, Register, then the questionnaire.
- The questionnaire saves after every answer, so closing the app mid-way resumes where she stopped.
- Later launches go straight to the main tabs.
- "Sign out" keeps the data on the device; the next launch shows a one-tap "Welcome back" screen.
- "Delete all data" erases everything on the device, including the app lock and the reminders.

## What the app does

- **Home**: cycle day, phase, next period, fertile window, health notes and quick log buttons.
- **Log**: start and end of the period (with undo), flow, symptoms and mood. Past days can be logged from the calendar.
- **Calendar**: month view with logged periods, predictions for the next 3 cycles and the fertile window.
- **Insights**: average cycle and period length, regularity, last cycles, most common symptoms and moods.
- **Health notes**: gentle "worth mentioning to a doctor" notes (cycle shorter than 21 or longer than 35 days, bleeding longer than 7 days, heavy flow 3 days out of 7, no period for 3 months).
- **App lock**: optional 4-digit PIN (only a hash is stored, in the phone's secure storage), fingerprint / face unlock, a waiting time after wrong PINs, and it locks again after the app was in the background for more than 10 seconds.
- **Reminders**: optional local notifications (before the expected period, and a daily reminder). The wording is discreet because notifications can show on a locked screen.
- **Doctor report**: a PDF with cycle numbers, the last periods, health notes and the most common symptoms, shared through the phone's share sheet.
- **Backup**: export everything as text (share sheet) and restore it later, from Settings or from the Register screen.
- **Languages**: English, Arabic (full right-to-left layout), French, Spanish, German, Portuguese.

Predictions use her own logged cycles (average of the last 3 to 6), not a fixed 28 days.
If her cycles vary by more than 7 days the app shows a range and hides the fertile window.

## Structure

    App.tsx                           Root: providers + navigation container
    index.ts                          Expo entry point
    app.json / eas.json               Expo and EAS build configuration
    assets/                           App icon, splash and notification icon
    docs/PRIVACY_POLICY.md            Privacy policy (publish it and put its address in src/config.ts)
    .github/workflows/ci.yml          Runs typecheck and tests on every push
    src/
      config.ts                       Values to fill in before publishing (privacy policy address)
      components/                     BottomSheet, LogSheet, HealthAlerts, LanguageSheet,
                                      RestoreSheet, RestoreLink, ReminderSheet,
                                      LockScreen, PinPad, PinSheet
      context/
        UserContext.tsx               Profile + questionnaire answers (saved on device)
        CycleContext.tsx              Logged periods + daily logs (saved on device)
        LockContext.tsx               App lock state (PIN hash in secure storage)
        ReminderContext.tsx           Reminder settings and local notifications
        useBackup.ts                  Export and restore everything
        useDoctorReport.ts            Builds and shares the PDF report
      data/
        questions.ts                  The onboarding questions (edit this to change them)
        logOptions.ts                 Flow, symptom and mood options
      i18n/
        I18nContext.tsx               t(), formatDate(), RTL helpers
        languages.ts                  The supported languages
        locales/                      One file per language + extra texts per feature
          extraTexts.ts               Merges all the feature texts files
      navigation/
        RootNavigator.tsx             Chooses Welcome/Register, Onboarding or Main
        BottomTabNavigator.tsx        Home, Calendar, Insights, Settings tabs
      screens/
        auth/                         Welcome, Register, SignIn
        onboarding/                   OnboardingScreen (one question per screen)
        main/                         Home, Calendar, Insights, Settings
      theme/
        index.ts                      Colors and shared card shadow
      utils/
        cycle.ts                      Cycle settings type
        cycleFromAnswers.ts           Turns questionnaire answers into cycle settings
        forecast.ts                   Predictions from the logged periods
        calendarDays.ts               What the calendar paints on each day
        insights.ts                   Cycle statistics and symptom counts
        healthAlerts.ts               Health notes rules
        backup.ts                     Build and validate the backup text
        pinLock.ts                    PIN rules: attempts and waiting time
        reminders.ts                  Reminder dates
        report.ts                     HTML of the doctor report
        *.test.ts                     Unit tests

## Tests

`npm test` runs the unit tests with Node's built-in test runner (through `tsx`, no extra setup).
They cover the logic that matters most: predictions, health notes, insights, the calendar marks,
the backup validation, the PIN rules, the reminder dates and the doctor report.

The same checks run on GitHub for every push (`.github/workflows/ci.yml`).

## Adding a translation file for a new feature

1. Create `src/i18n/locales/yourFeatureTexts.ts` with one object per language (same shape as `insightsTexts.ts`).
2. Add one line per language in `src/i18n/locales/extraTexts.ts`.

## Publishing

1. In `app.json` change `ios.bundleIdentifier` and `android.package` from `com.changeme.rosy`
   to your own id (for example `com.yourname.rosy`). It cannot be changed after the first release.
2. Publish `docs/PRIVACY_POLICY.md` on a public web page (for example GitHub Pages), add your contact email
   in it, and put the address in `PRIVACY_POLICY_URL` in `src/config.ts`.
3. Build with EAS:

        npx eas-cli login
        npx eas-cli build --platform android --profile preview      # APK to test on a phone
        npx eas-cli build --platform android --profile production   # file for the Play Store

## Roadmap

- [x] Welcome, registration, local profile
- [x] Onboarding questionnaire (17 questions, branching, resumable)
- [x] Home dashboard driven by the user's answers
- [x] Arabic translation and full RTL layout
- [x] Log period start/end, flow, symptoms and mood (quick log buttons)
- [x] Calendar with predictions (next period, ovulation, fertile window)
- [x] Insights: average cycle length, regularity, common symptoms
- [x] Health alerts (cycle < 21 or > 35 days, heavy bleeding, missed periods)
- [x] Backup and restore
- [x] Unit tests and CI
- [x] App lock (PIN / biometrics)
- [x] Reminders
- [x] PDF report for the doctor


## Note

Cycle predictions are estimates only and are not medical advice or a method of contraception.

## License

MIT, see `LICENSE`.
