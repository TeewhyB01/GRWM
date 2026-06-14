# Mobile Firebase Emulator QA

## Scope

Use this checklist to verify the mobile auth, profile, privacy consent, settings consent, auth persistence, and deletion request flows against local Firebase emulators. This path uses Expo development builds through EAS or local native run commands. Expo Go is not supported.

Local QA uses the demo project ID `demo-grwm` and safe placeholder Firebase client values. No real Firebase project, real Firebase API key, production user, production email, or real personal data is required.

Development build creation and install details live in `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md`.

## Latest Verified Run

- 2026-06-14: Manual A-G QA passed on the installed `com.grwm.mobile` development build.
- Target: iPhone 17 simulator, iOS 26.5.
- Emulators: isolated mobile config with UI `http://127.0.0.1:4001/`, Auth `9100`, Firestore `8085`, Functions `5002`, and Storage `9195`.
- Verified: signup, login/logout, auth persistence after relaunch, profile creation, privacy consent capture, Settings optional consent update, deletion request creation, and signed-out protection.
- Small blockers fixed during the run: Firebase Auth AsyncStorage persistence class shape and Firestore missing-own-document reads for first-run privacy/deletion checks.
- Evidence: `docs/MOBILE_MANUAL_QA_REPORT.md`.

## Emulator Environment

Copy the mobile emulator example into a local app env file:

```bash
cp apps/mobile/.env.emulators.example apps/mobile/.env.local
```

For iOS simulator, the default emulator host `127.0.0.1` is usually correct.

For Android emulator, change these values in `apps/mobile/.env.local`:

```bash
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=10.0.2.2
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=10.0.2.2
```

For a physical device, use your computer's LAN IP address instead of `127.0.0.1` or `10.0.2.2`.

The mobile client reads:

- `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true`
- `EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST`
- `EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT`
- `EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST`
- `EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT`

## Commands

Install dependencies:

```bash
pnpm install
```

Start the Firebase emulators for mobile QA:

```bash
pnpm qa:mobile:emulators
```

This command builds Functions first so the Functions emulator can load `functions/lib/index.js`.

If the standard local ports are already occupied by another project, use the isolated mobile QA config:

```bash
pnpm qa:mobile:emulators:isolated
```

For the isolated config, update `apps/mobile/.env.local` before starting Metro:

```bash
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9100
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8085
```

The isolated emulator UI runs at `http://127.0.0.1:4001`.

In a second terminal, start Metro for the development build:

```bash
pnpm mobile:start:dev-client
```

`pnpm qa:mobile:start` is an equivalent QA alias.

Validate local EAS/app development-build config without starting a cloud build or requiring an Expo account:

```bash
pnpm qa:mobile:eas:config
```

Logged-in EAS CLI users can also inspect the resolved platform config:

```bash
pnpm --filter mobile eas:config:development
pnpm --filter mobile eas:config:development:ios
```

Create development builds only when you are ready to install one on a simulator/device:

```bash
pnpm mobile:eas:build:ios-simulator
pnpm qa:mobile:eas:development:ios-simulator
pnpm qa:mobile:eas:development:ios
pnpm qa:mobile:eas:development:android
```

Install and run the latest EAS iOS simulator build from the development-simulator profile:

```bash
pnpm mobile:eas:run:ios
```

For a local iOS simulator build, use:

```bash
pnpm mobile:dev-client:ios-simulator
```

For a local Android emulator build, use:

```bash
pnpm mobile:dev-client:android
```

Before running the manual checklist on iOS, confirm the development build is installed on the booted simulator:

```bash
pnpm qa:mobile:install-check
```

If this command reports `No such file or directory`, install a simulator development build before continuing. Expo Go may be present on the simulator, but it must not be used for this QA path.

Do not use Expo Go for this QA path.

## Manual Checklist

- Start emulators with `pnpm qa:mobile:emulators`.
- Open Firebase Emulator UI at `http://127.0.0.1:4000`.
- Launch the app through an installed development build, then connect it to Metro with `pnpm qa:mobile:start`.
- If iOS launch reports `No development build (com.grwm.mobile)`, install a simulator development build first.
- If `xcrun simctl get_app_container booted com.grwm.mobile app` fails, install a simulator development build first.
- Create a new account with a synthetic email and password.
- Confirm the Auth emulator contains the new user.
- Confirm `/users/{uid}` is created in Firestore.
- Confirm `/userProfiles/{uid}` is created in Firestore.
- Confirm `/userProfiles/{uid}.locale` is `en`.
- Confirm the privacy consent screen appears before protected screens.
- Submit required privacy consents.
- Confirm `/privacyConsents/{uid}` is created.
- Confirm `/privacyConsents/{uid}.source` is `mobile`.
- Close and reopen the app.
- Confirm auth persistence keeps the user logged in.
- Log out.
- Log in again with the synthetic account.
- Update optional consents in Settings.
- Confirm `/privacyConsents/{uid}` updates in Firestore.
- Request account/data deletion from Settings.
- Confirm `/userDeletionRequests/{uid}` is created.
- Confirm `/userDeletionRequests/{uid}.status` is `requested`.
- Log out.
- Confirm an unauthenticated user cannot access Wardrobe, Today's Outfit, Settings, Onboarding, or Privacy directly.

## Known Limitations

- This checklist verifies mobile client writes and rules boundaries only.
- Account deletion processing is handled by the trusted backend `userDataDeletion` trigger; full Functions trigger integration QA is separate from this mobile checklist.
- Storage upload QA is out of scope for this auth/profile/privacy pass.
- The Functions emulator can start without mobile QA depending on function build output, but function definitions require compiled `functions/lib/index.js` before function endpoint or trigger QA.
- `pnpm functions:build`, `pnpm qa:mobile:emulators`, and `pnpm qa:mobile:emulators:isolated` generate the required Functions build output.
- Google, Apple, AI, avatar, payment, shopping, and production build paths are intentionally not part of this QA slice.
