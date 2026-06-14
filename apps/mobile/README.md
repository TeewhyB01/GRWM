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
- Wardrobe Home
- Today's Outfit
- Settings
