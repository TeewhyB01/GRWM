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

- `firestore.rules.test.ts`: Firestore owner, cross-user, admin-denial, unauthenticated-denial, deletion lifecycle, and wardrobe item field validation coverage.
- `storage.rules.test.ts`: Storage private path owner, unauthenticated-denial, upload policy, metadata, list denial, and generated avatar client-write denial coverage.
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
- User can create a valid private `wardrobeItems` document.
- User cannot create a `wardrobeItems` document with mismatched `userId`.
- User cannot create a `wardrobeItems` document missing required upload fields.
- User cannot create a `wardrobeItems` document with unsafe `analysisStatus`.
- User cannot update immutable owner fields or backend-owned analysis fields.
- User can update their own non-AI wardrobe metadata fields.
- User cannot read or write another user's `wardrobeItems` document.
- User can read their own `outfitRecommendations` document.
- User cannot read another user's `outfitRecommendations` document.
- Standard users cannot access `adminUsers`.
- Standard users cannot access `adminAuditLogs`.
- Unauthenticated users are denied private Firestore data.

## Storage Coverage

- Authenticated user can write under `users/{userId}/wardrobe/{itemId}/original`.
- Wardrobe uploads with invalid MIME type are denied.
- Oversized wardrobe uploads are denied.
- User cannot write under another user's Storage path.
- Wardrobe uploads with owner metadata mismatch are denied.
- Wardrobe uploads with item metadata mismatch are denied.
- Wardrobe uploads without consent version metadata are denied.
- User can read their own wardrobe image.
- User cannot read another user's wardrobe image.
- User can write under `users/{userId}/style-photos/{photoId}/original`.
- User can write under `users/{userId}/avatar/source/{photoId}/original`.
- User can read their own generated avatar output.
- Generated avatar output cannot be client-written or client-deleted.
- Unauthenticated users cannot access private Storage files.
- Broad Storage list operations are denied.
- Users can delete their own wardrobe original and cannot delete another user's wardrobe original.

## Before Production

- Add Firestore field-level validation for sensitive profile, consent, subscription, admin, avatar, style, and recommendation records.
- Add deeper field-level validation for deletion request lifecycle payloads after the admin processor contract stabilizes further.
- Add Storage content moderation, malware checks, byte-level content verification, and production retention rules.
- Add custom-claim-based admin checks and verify role changes cannot be self-granted.
- Add full Functions emulator tests for auth, consent, audit logging, and deletion trigger workflows.
- Verify mobile and admin clients use emulators locally and never hardcode Firebase credentials.
- Complete a privacy review before collecting photos, body data, location data, wardrobe data, or profile data in production.
