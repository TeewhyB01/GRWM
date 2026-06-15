# GRWM Architecture

## Monorepo Layout

- `apps/mobile`: Expo React Native mobile app using EAS development builds. Expo Go is not supported.
- `apps/admin`: Next.js App Router admin dashboard shell.
- `functions`: Firebase Cloud Functions TypeScript exports, runtime config helpers, placeholders for future workflows, and the trusted deletion processor.
- `packages/shared`: Shared TypeScript domain contracts, constants, and lightweight validation metadata.
- `firebase`: Firestore and Storage security rules plus emulator rule and deletion trigger tests.

## Platform Services

- Firebase Authentication for user identity.
- Cloud Firestore for user profiles, wardrobe metadata, styling context, and admin-visible operational records.
- Firebase Storage for user-uploaded images.
- Firebase Cloud Functions for trusted server-side workflows.

## Mobile Path Decision

- Framework: Expo React Native.
- Build workflow: EAS development builds with `expo-dev-client`.
- Unsupported workflow: Expo Go.
- Package manager: pnpm only.
- Language: TypeScript.
- Phase 1 navigation: local typed screen registry with Welcome, Login, Sign Up, Language, Country, Privacy, Onboarding, Wardrobe, Today's Outfit, and Settings screens.
- Phase 1 presentation: English-first i18n resources and light/dark theme tokens.
- Mobile Auth now uses Firebase Authentication email/password through EAS development builds, with an auth-state listener, loading state, protected-route gating, and AsyncStorage-backed persistence.
- Mobile signup creates `users/{userId}` and `userProfiles/{userId}` client-side after Firebase Auth succeeds. Google and Apple login remain deferred TODOs.
- Mobile privacy consent is captured in `privacyConsents/{userId}` with version `2026-06-foundation`, timestamp fields, and `source: mobile`.
- Mobile settings can view/update consent choices, create `userDeletionRequests/{userId}`, and log out.

## Admin App Decision

- Framework: Next.js App Router.
- Language: TypeScript.
- Routes: `/login`, `/dashboard`, `/users`, `/ai-monitoring`, `/moderation`, `/subscriptions`, `/affiliate`, and `/settings`.
- Protection model: placeholder protected layout with a local admin session stub until Firebase Authentication and custom claims are implemented.
- UI model: simple server-rendered admin components for shell navigation, page headers, metrics, and section panels.

## Firebase Functions Decision

- Functions include Firebase callable/request placeholders for future workflows plus the active `userDataDeletion` Firestore trigger.
- Placeholder files exist for wardrobe analysis, daily outfit recommendation, occasion outfit recommendation, avatar generation request, affiliate click tracking, and subscription webhook.
- Auth/privacy placeholders also exist for profile creation on sign-up, deletion requests, admin action logs, consent recording, and admin role validation.
- Auth/privacy placeholders now document the reserved backend contracts while the mobile client writes the tested user-owned documents in this phase.
- External API calls are disabled in Phase 1.
- User data deletion is implemented as a trusted Firestore trigger that processes `userDeletionRequests/{userId}` through Admin SDK deletion helpers and audit logging.

## Shared Contracts

- Shared types now cover `UserProfile`, `WardrobeItem`, `OutfitRecommendation`, `StyleProfile`, `AvatarProfile`, `SubscriptionPlan`, and `AdminRole`.
- Shared types also cover `User`, `PrivacyConsent`, `AdminUser`, `AdminAuditLog`, and `UserDeletionRequest`.
- `PrivacyConsent` includes `source: mobile`; `StyleProfile` includes empty placeholder fields for modesty and weather/location preference until full onboarding inputs are designed.
- Style, avatar, and recommendation records carry owner fields and timestamp fields so future workflows can audit lifecycle changes consistently.
- Lightweight schema metadata exists without adding a validation library. It is contract metadata for tests and client helpers, not a replacement for Firestore rules or server-side validation.

## Firebase Data And Access Decision

- Client Firebase config is environment-driven for mobile and admin.
- Mobile uses real Firebase Authentication email/password signup, login, logout, and auth-state listening. Admin auth remains a role-aware placeholder shell.
- Google and Apple login are intentionally deferred.
- Firestore collections are top-level and use `userId` fields for user-owned documents.
- Storage paths are private under `users/{userId}/...`.
- Admin role checks use the `adminUsers` collection as a rule-readable placeholder before custom claims are implemented.

## Privacy First Principles

- Collect only data needed for styling experiences.
- Keep user images in Firebase Storage with user-scoped access.
- Keep personally identifiable data out of logs.
- Require explicit user consent before using sensitive style, body-shape, or image-derived data.
- Account deletion is modeled through `userDeletionRequests` rather than direct client deletion.

## Current Auth And Privacy Flow

1. The app starts in an auth-checking state until Firebase resolves the current user.
2. Signed-out users can move through language/country collection, then create an email/password account.
3. After signup, the mobile client creates `users/{uid}` and `userProfiles/{uid}` with default locale, free plan, consent version, and country only if it was already selected.
4. The protected privacy screen records consent choices in `privacyConsents/{uid}` before the user continues to onboarding.
5. Settings reads the current consent document, updates consent choices, creates a deletion request document, and logs out through Firebase Auth.
6. The backend `userDataDeletion` trigger verifies the deletion request, deletes user-owned Firestore and Storage data, deletes the Auth user where available, writes audit logs, and keeps a minimal deletion request tombstone.

Manual emulator testing passed for signup/login/profile/consent/deletion request creation on 2026-06-14 and should be rerun after auth, privacy, rules, or deletion-flow changes.

## Future Architecture Phases

1. Wardrobe onboarding for explicit user-provided style, fit, modesty, and context preferences.
2. Wardrobe upload security boundary, including Storage MIME/size checks, upload metadata, and `wardrobeItems` field validation.
3. Wardrobe upload and metadata.
4. Weather and occasion context.
5. AI recommendation service boundary.
6. Avatar and virtual try-on architecture.
7. Premium, shopping, and affiliate integrations.

## Latest Architecture Review

See `docs/ARCHITECTURE_REVIEW.md` for the 2026-06-15 review. Current health is amber: the repository structure is clean enough for wardrobe onboarding foundation work, but wardrobe upload should wait for Storage upload constraints, Firestore field validation, and admin-auth hardening.
