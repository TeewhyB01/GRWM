# Mobile Firebase Emulator QA

## Scope

Use this checklist to verify the mobile auth, profile, privacy consent, settings consent, auth persistence, and deletion request flows against local Firebase emulators. This path uses Expo development builds through EAS or local native run commands. Expo Go is not supported.

Local QA uses the demo project ID `demo-grwm` and safe placeholder Firebase client values. No real Firebase project, real Firebase API key, production user, production email, or real personal data is required.

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

In a second terminal, start Metro for the development build:

```bash
pnpm qa:mobile:start
```

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
pnpm qa:mobile:eas:development:ios-simulator
pnpm qa:mobile:eas:development:ios
pnpm qa:mobile:eas:development:android
```

Do not use Expo Go for this QA path.

## Manual Checklist

- Start emulators with `pnpm qa:mobile:emulators`.
- Open Firebase Emulator UI at `http://127.0.0.1:4000`.
- Launch the app through an installed development build, then connect it to Metro with `pnpm qa:mobile:start`.
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
- Account deletion is requested by the client but not processed; a trusted backend deletion processor is still required.
- Storage upload QA is out of scope for this auth/profile/privacy pass.
- Google, Apple, AI, avatar, payment, shopping, and production build paths are intentionally not part of this QA slice.
