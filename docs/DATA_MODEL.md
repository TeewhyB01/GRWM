# GRWM Data Model

## Firestore Collections

- `users`: Firebase Auth-linked user records.
- `userProfiles`: user profile, locale, country, and plan metadata.
- `privacyConsents`: versioned consent choices for sensitive data use.
- `wardrobeItems`: wardrobe metadata and Firebase Storage references.
- `styleProfiles`: user preference, fit, and private body-shape notes.
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

## Validation

Shared TypeScript schemas live in `packages/shared/src/validation.ts`. They are lightweight field-presence checks for foundation testing and are not a replacement for server-side validation in Cloud Functions.
