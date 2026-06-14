# Security Rules Testing

## Commands

Run Firestore rules tests:

```bash
pnpm test:firestore-rules
```

Run Storage rules tests:

```bash
pnpm test:storage-rules
```

Run both suites:

```bash
pnpm test:firebase-rules
```

`pnpm emulators:rules` is an alias for the combined rules suite.

The rule-test commands use `firebase/firebase.test.json` and the demo project `demo-grwm-rules`. This keeps tests isolated from a developer's long-running `pnpm emulators:start` session.

## Test Structure

Rules tests live in `firebase/tests/`.

- `firestore.rules.test.ts`: Firestore owner, cross-user, admin-denial, and unauthenticated-denial coverage.
- `storage.rules.test.ts`: Storage private path owner and unauthenticated-denial coverage.
- `helpers/ids.ts`: synthetic user IDs and document IDs.
- `helpers/paths.ts`: Firestore and Storage path builders.
- `helpers/seedData.ts`: local seed data builders with no real personal data.
- `helpers/testEnvironment.ts`: rules test environment setup, authenticated contexts, admin contexts, and emulator cleanup.
- `seedLocalEmulator.ts`: optional local Auth and Firestore emulator seed script.

## Firestore Coverage

- Authenticated user can read and write their own `users/{userId}` document.
- User cannot read or write another user's user document.
- User can read and write their own `userProfiles` document.
- User cannot read or write another user's `userProfiles` document.
- User can read and write their own `privacyConsents` document.
- User cannot read or write another user's `privacyConsents` document.
- User can create their own `userDeletionRequests/{uid}` document with `status: requested`.
- User cannot create a deletion request for another user.
- User cannot create deletion requests with extra personal fields such as a free-form reason.
- User can read their own deletion request status.
- User cannot client-update deletion request status to backend-owned lifecycle states such as `processing` or `completed`.
- Role-checked admin clients cannot update deletion lifecycle status through Firestore rules; trusted Admin SDK code owns status transitions.
- User can read and write their own `wardrobeItems` document.
- User cannot read or write another user's `wardrobeItems` document.
- User can read their own `outfitRecommendations` document.
- User cannot read another user's `outfitRecommendations` document.
- Standard users cannot access `adminUsers`.
- Standard users cannot access `adminAuditLogs`.
- Unauthenticated users are denied private Firestore data.

## Storage Coverage

- Authenticated user can write under `users/{userId}/wardrobe/{itemId}/original`.
- User cannot write under another user's Storage path.
- User can read their own wardrobe image.
- User cannot read another user's wardrobe image.
- User can write under `users/{userId}/style-photos/{photoId}/original`.
- User can write under `users/{userId}/avatar/source/{photoId}/original`.
- User can read their own generated avatar output.
- Unauthenticated users cannot access private Storage files.

## Before Production

- Add Firestore field-level validation for sensitive profile, wardrobe, consent, deletion, subscription, and admin records.
- Add deeper field-level validation for deletion request lifecycle payloads after the admin processor contract stabilizes further.
- Add Storage MIME type, max file size, content moderation, and retention rules.
- Add custom-claim-based admin checks and verify role changes cannot be self-granted.
- Add full Functions emulator tests for auth, consent, audit logging, and deletion trigger workflows.
- Verify mobile and admin clients use emulators locally and never hardcode Firebase credentials.
- Complete a privacy review before collecting photos, body data, location data, wardrobe data, or profile data in production.
