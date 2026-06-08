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

## Emulator Recommendation

Firebase emulators are needed next before real user data is stored. The next backend pass should add emulator configuration, rule tests, and seed scripts for a local owner admin user.
