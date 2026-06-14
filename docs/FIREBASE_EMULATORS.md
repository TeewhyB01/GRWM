# Firebase Emulators

## Scope

The local Firebase workflow covers Authentication, Cloud Firestore, Firebase Storage, and Cloud Functions emulators for GRWM foundation testing. The rules tests use synthetic users only and do not require real Firebase projects or real personal data.

## Ports

- Emulator UI: `4000`
- Emulator hub: `4400`
- Authentication: `9099`
- Cloud Firestore: `8080`
- Cloud Functions: `5001`
- Firebase Storage: `9199`

These ports are defined in `firebase.json`.

Rules tests use `firebase/firebase.test.json` so they can run even when the normal local emulators are already open. The test-only ports are:

- Test emulator hub: `4410`
- Test Cloud Firestore: `8085`
- Test Firebase Storage: `9195`
- Test logging emulator: `4505`

Mobile QA can also use `firebase/firebase.mobile-isolated.json` if another local project already owns the standard ports:

- Isolated Emulator UI: `4001`
- Isolated emulator hub: `4410`
- Isolated Authentication: `9100`
- Isolated Cloud Firestore: `8085`
- Isolated Cloud Functions: `5002`
- Isolated Firebase Storage: `9195`

## Start Emulators

```bash
pnpm emulators:start
```

This starts the local emulators for the demo project `demo-grwm`. The Functions emulator loads the compiled Functions exports, including the `userDataDeletion` Firestore trigger for backend deletion processing.

For mobile auth/profile/privacy QA, use the mobile-specific alias:

```bash
pnpm qa:mobile:emulators
```

The mobile QA command starts Auth, Firestore, Storage, and Functions emulators for the same demo project. The mobile app can connect to Auth at port `9099` and Firestore at port `8080`; no real Firebase project is required when `apps/mobile/.env.local` is based on `apps/mobile/.env.emulators.example`.

If those ports are occupied, use:

```bash
pnpm qa:mobile:emulators:isolated
```

Then point `apps/mobile/.env.local` at Auth `9100` and Firestore `8085`.

## Mobile Emulator Client Config

The Expo mobile app reads safe emulator placeholders from `apps/mobile/.env.local`. Start with:

```bash
cp apps/mobile/.env.emulators.example apps/mobile/.env.local
```

Default simulator values:

```bash
EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-grwm
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

Use `10.0.2.2` for Android emulator host values, or your computer's LAN IP for physical-device QA.

## Seed Local Users

Start the emulators first, then run:

```bash
pnpm emulators:seed
```

The seed helper creates only synthetic local data:

- `local-user-a`
- `local-user-b`
- `local-admin-owner`
- `local-admin-moderator`
- sample user profile
- sample privacy consent
- sample wardrobe item
- sample deletion request
- local admin role documents

The seed script points the Admin SDK at `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` and `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` if those variables are not already set.

Seeded deletion requests use `userDeletionRequests/{uid}` so the backend deletion processor ownership check can run safely in emulator-only testing.

## Export Local Emulator Data

```bash
pnpm emulators:export
```

The export target is `.firebase-emulator-data/`, which is intentionally ignored by git.

## Current Limitations

- The Auth emulator is configured and seedable, but rules tests use mocked authenticated contexts from `@firebase/rules-unit-testing`.
- Mobile emulator QA still requires an installed Expo development build; Expo Go is unsupported.
- Functions unit tests cover deletion helper behavior, audit payload shape, target selection, and a fake-dependency processor run. Full Functions emulator trigger integration tests are not implemented yet.
- Storage rules do not yet enforce MIME type, max file size, virus scanning, or moderation status.
- Firestore rules validate ownership and coarse admin access, not full field schemas or every status transition.
- Production admin bootstrap still needs trusted Admin SDK credentials outside the client rules path.

Backend deletion processor details and production readiness checklist: `docs/USER_DATA_DELETION.md`.

## Manual Mobile QA

Use `docs/MOBILE_EMULATOR_QA.md` for the full development-build checklist covering signup, login, auth persistence, profile documents, privacy consent capture, Settings consent updates, and deletion request creation.
