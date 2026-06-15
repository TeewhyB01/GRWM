# GRWM Mobile

Expo React Native shell for the GRWM mobile app.

## Mobile Path Decision

- Use Expo React Native.
- Use EAS development builds.
- Use `expo-dev-client` when the app is scaffolded.
- Do not use Expo Go.
- Do not use npm.
- Use pnpm only.

## Future Commands

```bash
pnpm mobile:start:dev-client
pnpm mobile:dev-client:ios-simulator
pnpm mobile:dev-client:android
pnpm mobile:eas:build:ios-simulator
pnpm mobile:eas:run:ios
pnpm --filter mobile eas:validate:development
pnpm --filter mobile eas config --profile development --platform android --non-interactive
pnpm --filter mobile eas build --profile development --platform ios
pnpm --filter mobile eas build --profile development --platform android
```

Local package scripts can also run as:

```bash
pnpm --filter mobile start
pnpm --filter mobile start:dev-client
pnpm --filter mobile eas:validate:development
pnpm --filter mobile eas:config:development
pnpm --filter mobile eas:config:development:ios
pnpm --filter mobile eas:build:development:ios-simulator
pnpm --filter mobile eas:build:run:ios
pnpm --filter mobile eas:build:development:ios
pnpm --filter mobile eas:build:development:android
pnpm --filter mobile eas:build:ios
pnpm --filter mobile eas:build:android
pnpm --filter mobile typecheck
pnpm --filter mobile test
```

## Firebase Emulator QA

Use local Firebase emulators for auth/profile/privacy QA. No real Firebase project is required when using the safe demo values.

```bash
cp apps/mobile/.env.emulators.example apps/mobile/.env.local
pnpm qa:mobile:emulators
pnpm mobile:start:dev-client
```

If the standard Firebase ports are occupied by another local project, run the isolated emulator config and point `.env.local` to Auth `9100` and Firestore `8085`:

```bash
pnpm qa:mobile:emulators:isolated
```

For Android emulator, set these in `apps/mobile/.env.local`:

```bash
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=10.0.2.2
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=10.0.2.2
```

For physical devices, use the computer's LAN IP address. Run this app through an installed development build; Expo Go is intentionally unsupported.

Full checklist: `docs/MOBILE_EMULATOR_QA.md`.

Development build creation and install guide: `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md`.

## Local QA Access

When Simulator text input is unreliable, local emulator testers can enable a dev-only QA access button on Welcome/Login. It is disabled by default and must never be used as a production feature.

Enable it only in ignored local env while using the demo Firebase emulator config:

```bash
GRWM_ENABLE_QA_ACCESS=true
EXPO_PUBLIC_GRWM_ENABLE_QA_ACCESS=true
GRWM_QA_EMAIL_PREFIX=wardrobe-qa
EXPO_PUBLIC_GRWM_QA_EMAIL_PREFIX=wardrobe-qa
```

Restart Metro after changing env values. The button is hidden unless the app is running locally, Firebase emulator mode is on, both QA flags are true, and the Firebase project is `demo-grwm`. To confirm the default disabled state, leave both flags as `false`, restart Metro, and confirm Welcome/Login do not show "Continue with local QA account."

The QA button creates a generated `example.test` Auth user and ensures only `users/{uid}` and `userProfiles/{uid}` exist. It does not create privacy consent from the visible button, does not create `wardrobeSetupProfiles`, does not create `wardrobeItems`, does not upload Storage files, and does not create AI jobs. Wardrobe onboarding manual QA must still save privacy consent through the app and complete the wardrobe setup screens.

Latest manual result: on 2026-06-14, the installed `com.grwm.mobile` development build passed A-G auth/profile/privacy/deletion QA on the iPhone 17 simulator against isolated Firebase emulators. Evidence and Firestore document snapshots are in `docs/MOBILE_MANUAL_QA_REPORT.md`.

Latest wardrobe onboarding manual result: on 2026-06-15, the installed `com.grwm.mobile` development build passed the A-J wardrobe onboarding checklist against isolated Firebase emulators. The dev-only local QA access harness was used only to bypass unreliable simulator account text entry; privacy consent and wardrobe setup were still completed through the app UI. Evidence is in `docs/MOBILE_WARDROBE_ONBOARDING_QA_REPORT.md`.

## Wardrobe Onboarding Foundation

Wardrobe setup is available to signed-in users after privacy consent. It stores private setup preferences at `wardrobeSetupProfiles/{userId}` and does not upload images.

Screens:

- `WardrobeSetupIntroScreen`
- `WardrobePrivacyExplainerScreen`
- `WardrobeCategoryPreferencesScreen`
- `WardrobeStyleBasicsScreen`
- `WardrobeSetupSummaryScreen`
- `WardrobeHomeScreen` empty state

The Wardrobe Home empty state shows "Add wardrobe item soon" as a disabled placeholder CTA. The app must not open an image picker, write Firebase Storage objects, create image-backed `wardrobeItems`, or request AI analysis in this phase.

Manual QA after upload UI changes should use an installed development build, not Expo Go. Verify setup save/resume, completion, Settings privacy link, the upload flow, and the consent/privacy boundaries before enabling any release-facing upload path.

## Wardrobe Image Upload UI

The private wardrobe image upload UI MVP is implemented. It is limited to photo-library selection, Firestore draft-first upload, exact private Firebase Storage upload, backend finalisation listening, and Wardrobe Home list display.

Current mobile dependency state:

- `expo-image-picker` is installed.
- `apps/mobile/app.json` includes the ImagePicker config plugin with privacy-first photo permission copy.
- Camera and microphone permissions are disabled through the config plugin where supported.
- The app calls only photo-library picker APIs, not camera APIs.

The dependency was installed with:

```bash
pnpm --filter mobile exec expo install expo-image-picker
```

If pnpm is not on PATH:

```bash
/Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm --filter mobile exec expo install expo-image-picker
```

Rebuild the installed development build after adding the dependency or changing native config. Manual upload QA is pending until that rebuild is installed.

The upload UI creates a Firestore draft first, uploads to the exact private Storage path with required metadata, shows progress/error/cancel/retry states, and lets the backend finalisation handler mark the item `uploaded`. It must not create AI jobs, avatar workflows, shopping, payment, affiliate, public sharing, or destructive cleanup.

Manual QA checklist: `docs/MOBILE_WARDROBE_UPLOAD_QA.md`.

Account/data deletion remains a client request flow in mobile: Settings creates `userDeletionRequests/{uid}` with `status: requested`, `requestedBy: user`, and `source: mobile`. The mobile client must not directly delete private Firestore records, Firebase Storage files, or Firebase Auth users. The trusted backend `userDataDeletion` trigger processes deletion securely and may sign the user out after completion.

Deletion copy shown in Settings should continue to communicate:

- "Your deletion request has been submitted."
- "GRWM will process deletion securely."
- "You may be signed out after deletion is completed."

`pnpm --filter mobile eas:config:development` calls EAS CLI and requires an Expo account or `EXPO_TOKEN`. Use `pnpm qa:mobile:eas:config` for local config validation that does not contact EAS.

The native development-build identifiers are:

- iOS bundle identifier: `com.grwm.mobile`
- Android package: `com.grwm.mobile`

Before running iOS simulator QA, confirm the installed development build exists:

```bash
pnpm qa:mobile:install-check
```

If it is missing, install one with `pnpm mobile:dev-client:ios-simulator` or `pnpm mobile:eas:build:ios-simulator` followed by `pnpm mobile:eas:run:ios` before starting the manual A-G checklist.

## Local QA Scripts

From the repo root:

```bash
pnpm qa:mobile:emulators
pnpm qa:mobile:emulators:isolated
pnpm qa:mobile:install-check
pnpm qa:mobile:typecheck
pnpm qa:mobile:test
pnpm qa:mobile:eas:config
pnpm qa:mobile:eas:development:ios-simulator
pnpm qa:mobile:eas:development:ios
pnpm qa:mobile:eas:development:android
pnpm functions:build
```

## Phase 1 Screens

- Welcome
- Login
- Sign Up
- Language Selection
- Country Selection
- Onboarding Start
- Wardrobe Setup Intro
- Wardrobe Privacy Explainer
- Wardrobe Category Preferences
- Wardrobe Style Basics
- Wardrobe Setup Summary
- Wardrobe Home
- Today's Outfit
- Settings
