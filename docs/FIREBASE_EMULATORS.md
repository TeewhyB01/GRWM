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

## Start Emulators

```bash
pnpm emulators:start
```

This starts the local emulators for the demo project `demo-grwm`. The Functions emulator is configured because the repo has a `functions` workspace, but the current functions are placeholders and are not part of the security rules tests yet.

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

## Export Local Emulator Data

```bash
pnpm emulators:export
```

The export target is `.firebase-emulator-data/`, which is intentionally ignored by git.

## Current Limitations

- The Auth emulator is configured and seedable, but rules tests use mocked authenticated contexts from `@firebase/rules-unit-testing`.
- Functions emulator startup is configured, but function-trigger integration tests are not implemented yet.
- Storage rules do not yet enforce MIME type, max file size, virus scanning, or moderation status.
- Firestore rules validate ownership and coarse admin access, not full field schemas or every status transition.
- Production admin bootstrap still needs trusted Admin SDK credentials outside the client rules path.
