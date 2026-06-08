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
- Mobile has lazy Firebase Auth initialization in `apps/mobile/src/firebase`.
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

## Emulator Documentation

- `docs/FIREBASE_EMULATORS.md`
- `docs/SECURITY_RULES_TESTING.md`
