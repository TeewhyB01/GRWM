# GRWM Firebase Setup

## Scope

This project uses Firebase Authentication, Cloud Firestore, Firebase Storage, and Firebase Cloud Functions. No real Firebase keys are committed. All client and Functions configuration must come from environment variables.

## Required Environment Variables

Mobile Expo client:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_USE_FIREBASE_EMULATORS`
- `EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST`
- `EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT`
- `EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST`
- `EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT`

Admin Next.js client:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`

Functions and server runtime:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FUNCTIONS_REGION`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `FIREBASE_AUTH_EMULATOR_HOST`
- `FIRESTORE_EMULATOR_HOST`
- `FIREBASE_STORAGE_EMULATOR_HOST`
- `FIREBASE_FUNCTIONS_EMULATOR_HOST`

## Current Implementation

- `firebase.json` points Firebase CLI at Firestore rules, Storage rules, Functions, and local emulator ports.
- `.firebaserc.example` documents the project alias shape without committing a real project ID.
- `.env.mobile.emulators.example` and `apps/mobile/.env.emulators.example` provide safe demo placeholders for local emulator QA.
- Mobile has lazy Firebase Auth initialization in `apps/mobile/src/firebase`.
- Mobile Auth uses `@react-native-async-storage/async-storage` for Firebase Auth persistence in EAS development builds.
- Mobile Firestore writes user-owned signup/profile/consent/deletion documents through the existing rules boundary.
- Admin has lazy Firebase client initialization in `apps/admin/src/lib/firebase`.
- Functions have runtime config helpers in `functions/src/config.ts`.
- Firestore and Storage rules model user-owned data and private user file paths.
- Local emulator scripts live in the root `package.json`.
- Firebase rules tests live in `firebase/tests`.
- Synthetic local seed helpers live in `firebase/tests/helpers/seedData.ts`.

## Local Emulator Commands

```bash
pnpm emulators:start
pnpm emulators:seed
pnpm emulators:export
pnpm test:firestore-rules
pnpm test:storage-rules
pnpm test:firebase-rules
```

The configured demo project ID is `demo-grwm`. The current emulator setup is ready for local rules testing, but production use still requires real Firebase project configuration, trusted admin bootstrap, and a full privacy review.

## Mobile Auth/Profile Flow

With mobile Firebase environment variables set, signup uses Firebase Authentication email/password and then writes:

- `users/{uid}`
- `userProfiles/{uid}`

The protected privacy step writes `privacyConsents/{uid}`. Settings can update that consent document, create `userDeletionRequests/{uid}`, and log out.

If `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true`, the mobile client points Auth at `127.0.0.1:9099` and Firestore at `127.0.0.1:8080`.

The host and port are configurable for simulator/device differences:

```bash
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

Use `10.0.2.2` for Android emulator host values. Use a LAN IP address for physical devices. With the safe demo values from `apps/mobile/.env.emulators.example`, local QA does not require a real Firebase project.

## EAS Development Builds

Mobile QA must run through a development build, not Expo Go.

```bash
pnpm qa:mobile:eas:config
pnpm qa:mobile:eas:development:ios-simulator
pnpm qa:mobile:eas:development:ios
pnpm qa:mobile:eas:development:android
pnpm qa:mobile:start
```

`pnpm qa:mobile:eas:config` runs local app/EAS config assertions without starting a cloud build or requiring an Expo account. The `pnpm --filter mobile eas:config:development` command is also available for logged-in EAS CLI users. The build commands are development-build commands only and are not store publishing commands.

## Manual Testing Still Needed

- Run the full signup, login, auth persistence, logout, consent capture, consent update, and deletion request flows in an EAS development build.
- Repeat those flows against the Firebase Auth and Firestore emulators.
- Verify production Firebase project config before collecting real user data.
- Follow `docs/MOBILE_EMULATOR_QA.md` for the exact local checklist.

## Emulator Documentation

- `docs/FIREBASE_EMULATORS.md`
- `docs/SECURITY_RULES_TESTING.md`
