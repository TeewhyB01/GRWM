# User Data Deletion

## Scope

GRWM processes account and data deletion through a trusted Firebase Cloud Function. The mobile client only creates `userDeletionRequests/{userId}` with `status: requested`; it does not directly delete Firestore documents, Storage files, or Firebase Auth users.

## Request Model

`userDeletionRequests/{userId}` stores a minimal lifecycle record:

- `id`
- `userId`
- `status`: `requested`, `processing`, `completed`, `failed`, or `cancelled`
- `requestedAtIso`
- `processingStartedAtIso`
- `completedAtIso`
- `failedAtIso`
- `failureReason`
- `requestedBy`: `user` or `admin`
- `source`: `mobile`, `admin`, or `function`
- `consentVersionAtRequest`
- `auditLogId`

The client-created record does not store passwords, photo names, wardrobe details, or a free-form deletion reason.

## Backend Processor Flow

1. Mobile Settings creates `userDeletionRequests/{userId}`.
2. `userDataDeletion` runs from an `onDocumentCreated` trigger on `userDeletionRequests/{userId}`.
3. The processor verifies that the request document ID, `id`, and `userId` all match.
4. The processor writes a deletion-requested audit log.
5. The processor marks the request as `processing`.
6. The processor deletes current and future user-owned Firestore records by explicit owner-keyed paths or `userId` queries.
7. The processor deletes private Firebase Storage files under explicit user-scoped prefixes.
8. The processor deletes the Firebase Auth user. Missing Auth users are treated as already removed.
9. The processor marks the request as `completed` and keeps a minimal tombstone.
10. If a step fails, the processor marks the request as `failed` with a safe failure reason and writes a failure audit log.

## Firestore Deletion Coverage

Current owner-keyed documents:

- `users/{userId}`
- `userProfiles/{userId}`
- `privacyConsents/{userId}`
- `styleProfiles/{userId}`
- `avatarProfiles/{userId}`
- `subscriptions/{userId}`

Current `userId` query collections:

- `wardrobeItems`
- `outfitRecommendations`

Future `userId` query collections prepared for deletion:

- `savedOutfits`
- `wornOutfits`
- `outfitPhotos`
- `avatarGenerations`
- `shoppingRecommendations`
- `affiliateClicks`
- `payments`
- `aiJobs`
- `aiUsageLogs`
- `userFeedback`
- `reports`

The processor does not delete `adminAuditLogs`, `adminUsers`, global app config, or anonymous aggregate analytics that no longer contain a personal user identifier. It retains `userDeletionRequests/{userId}` as a minimal status tombstone.

## Storage Deletion Coverage

The processor deletes all files under:

- `users/{userId}/wardrobe/`
- `users/{userId}/style-photos/`
- `users/{userId}/avatar/source/`
- `users/{userId}/avatar/generated/`
- `users/{userId}/outfits/`

Audit logs record file counts, not private object names.

## Audit Logging

The processor writes `adminAuditLogs` entries for:

- `user-deletion.requested`
- `user-deletion.processing-started`
- `user-deletion.firestore-completed`
- `user-deletion.storage-completed`
- `user-deletion.auth-completed`
- `user-deletion.completed`
- `user-deletion.failed`

Audit entries use the system actor `system:deletion-processor`, target `userDeletionRequests`, the target user ID, lifecycle status, and non-sensitive metadata such as deletion counts or safe failure reason.

## Emulator Testing Coverage

Unit tests cover:

- Deletion request lifecycle status payloads.
- Firestore target selection and admin collection exclusion.
- Storage prefix selection.
- Audit log payload shape.
- Auth user-not-found handling.
- A lightweight processor run with fake Firestore, Storage, and Auth dependencies.

Rules tests cover:

- Users can create only their own `requested` deletion request at `userDeletionRequests/{uid}`.
- Users can read their own deletion request status.
- Users cannot update deletion request status from the client.
- Cross-user deletion request creation is denied.

Full Functions emulator trigger integration is still a production readiness item.

## Production Readiness Checklist

- Run the full requested pnpm gate suite.
- Run Firebase Functions emulator integration for the `onDocumentCreated` trigger.
- Verify production Firebase project config and Storage bucket environment values.
- Confirm admin/support procedures for failed requests.
- Confirm legal retention handling for payment/provider records before enabling real payment features.
- Confirm anonymous aggregate analytics contain no personal user identifiers before retention.
- Re-run mobile A-G manual QA in an installed development build after any auth/privacy/rules change.
