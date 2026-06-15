# GRWM Data Model

## Firestore Collections

- `users`: Firebase Auth-linked user records.
- `userProfiles`: user profile, locale, country, and plan metadata.
- `privacyConsents`: versioned consent choices for sensitive data use, including `source: mobile`.
- `wardrobeItems`: wardrobe metadata and Firebase Storage references.
- `styleProfiles`: user preference, fit, modesty preference placeholder, weather/location preference placeholder, and private body-shape notes.
- `outfitRecommendations`: future recommendation records, currently placeholders.
- `avatarProfiles`: future avatar workflow records, currently placeholders.
- `subscriptions`: future subscription state records.
- `adminUsers`: admin identity and role records.
- `adminAuditLogs`: append-only admin action log records.
- `userDeletionRequests`: privacy deletion workflow requests.

## Admin Roles

- `owner`
- `admin`
- `moderator`
- `support`
- `analyst`

## Storage Paths

- `users/{userId}/wardrobe/{itemId}/original`
- `users/{userId}/style-photos/{photoId}/original`
- `users/{userId}/avatar/source/{photoId}/original`
- `users/{userId}/avatar/generated/{generationId}`
- `users/{userId}/outfits/{outfitId}`

All paths are private and user-scoped. Admin service code may access files through trusted server credentials, but client-side Storage rules do not make private user files public.

Client-writable image uploads must include owner-bound custom metadata and must fit the allowed MIME type and size policy in `packages/shared/src/uploadPolicy.ts`. Generated avatar outputs are modeled as private user-scoped objects but are backend-owned and not client-writable.

## Validation

Shared TypeScript schemas live in `packages/shared/src/validation.ts`. They are lightweight field-presence checks for foundation testing and are not a replacement for Firestore rules or server-side validation in Cloud Functions.

The shared schemas now require owner fields, array fields, wardrobe upload fields, analysis lifecycle fields, and timestamp fields that are present in the TypeScript contracts. `wardrobeItems` Firestore rules validate allowed enum values, immutable owner fields, private visibility, client-writable source values, analysis status, and Storage path consistency.

## Mobile Auth/Profile Documents

Email/password signup creates:

- `users/{userId}` with `id`, `email`, `emailVerified`, `authProvider: password`, `disabled: false`, `createdAtIso`, `updatedAtIso`, and `lastLoginAtIso`.
- `userProfiles/{userId}` with `id`, `userId`, `displayName`, `locale: en`, `countryCode`, `subscriptionPlanId: free`, `privacyConsentVersion`, `createdAtIso`, and `updatedAtIso`.

`countryCode` is stored only when the mobile flow has already collected it. If not collected, it remains an empty string until the user saves a country preference.

## Consent And Deletion Documents

`privacyConsents/{userId}` stores all consent purposes as booleans, `version: 2026-06-foundation`, `source: mobile`, `createdAtIso`, and `updatedAtIso`.

`userDeletionRequests/{userId}` stores the deletion lifecycle tombstone: `id`, `userId`, `requestedAtIso`, `status`, `processingStartedAtIso`, `completedAtIso`, `failedAtIso`, `failureReason`, `requestedBy`, `source`, `consentVersionAtRequest`, and `auditLogId`.

Allowed deletion statuses are `requested`, `processing`, `completed`, `failed`, and `cancelled`. The mobile client creates only `requested` records with `requestedBy: user` and `source: mobile`. Trusted backend code owns all later status transitions.

The backend deletion processor deletes private user-owned data from current owner-keyed documents (`users`, `userProfiles`, `privacyConsents`, `styleProfiles`, `avatarProfiles`, and `subscriptions`), current `userId` query collections (`wardrobeItems` and `outfitRecommendations`), and prepared future `userId` query collections (`savedOutfits`, `wornOutfits`, `outfitPhotos`, `avatarGenerations`, `shoppingRecommendations`, `affiliateClicks`, `payments`, `aiJobs`, `aiUsageLogs`, `userFeedback`, and `reports`). It keeps a minimal `userDeletionRequests/{userId}` tombstone and never deletes `adminAuditLogs` or `adminUsers`.

## Placeholder Preference Persistence

The current onboarding start step can create `styleProfiles/{userId}` with `id`, `userId`, empty arrays/strings for style identity, modesty, weather/location, fit, and body-shape notes, plus `createdAtIso` and `updatedAtIso`. These placeholders exist so later onboarding screens can replace them with explicit user-provided values without changing the collection boundary.

## Model Review Notes

- `User`: owner-keyed by Auth UID with email, provider, disabled flag, and ISO lifecycle timestamps. Production should move sensitive lifecycle updates to trusted backend code.
- `UserProfile`: owner-keyed by user ID with locale, country, plan ID, consent version, and timestamps.
- `PrivacyConsent`: owner-keyed by user ID with explicit boolean purposes, version, source, and timestamps. It does not store free-form sensitive notes.
- `WardrobeItem`: queryable by `userId`, includes private `storagePath`, `primaryColour`, visibility, user-provided tags, source, analysis status, analysis consent reference, and timestamps. Client writes are limited to private, manual/import records with `analysisStatus: not_requested`; backend-owned analysis transitions are not active.
- `StyleProfile`: owner-keyed by user ID, includes placeholder arrays/strings and timestamps. Body-shape notes remain private and should stay user-controlled.
- `OutfitRecommendation`: queryable by `userId`, includes item IDs, generated text, status, and timestamps. AI generation is not implemented.
- `AvatarProfile`: owner-keyed by user ID, includes consent version, source image paths, status, and timestamps. Avatar processing is not implemented.
- `SubscriptionPlan`: global plan catalog model only. User subscription state remains backend/webhook-owned under `subscriptions/{userId}`.
- `AdminUser`: admin role record with active flag and timestamps. The first owner still requires trusted bootstrap.
- `AdminAuditLog`: append-only operational audit shape. Deletion audit logs extend it with system actor, status, source, target user, and safe metadata.
- `UserDeletionRequest`: owner-keyed lifecycle tombstone. The mobile client can create only `requested` records; backend code owns processing, completion, failure, and audit fields.
