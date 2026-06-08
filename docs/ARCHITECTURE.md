# GRWM Architecture

## Monorepo Layout

- `apps/mobile`: Expo React Native mobile app using EAS development builds. Expo Go is not supported.
- `apps/admin`: Next.js App Router admin dashboard shell.
- `functions`: Firebase Cloud Functions TypeScript placeholder exports and runtime config helpers.
- `packages/shared`: Shared TypeScript domain contracts, constants, and lightweight validation metadata.
- `firebase`: Firestore and Storage security rule placeholders.

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

- Functions are exported as Firebase callable/request placeholders only.
- Placeholder files exist for wardrobe analysis, daily outfit recommendation, occasion outfit recommendation, avatar generation request, user data deletion, affiliate click tracking, and subscription webhook.
- Auth/privacy placeholders also exist for profile creation on sign-up, deletion requests, admin action logs, consent recording, and admin role validation.
- Auth/privacy placeholders now document the reserved backend contracts while the mobile client writes the tested user-owned documents in this phase.
- External API calls are disabled in Phase 1.
- User data deletion is the privacy-critical placeholder to prioritize before production data collection.

## Shared Contracts

- Shared types now cover `UserProfile`, `WardrobeItem`, `OutfitRecommendation`, `StyleProfile`, `AvatarProfile`, `SubscriptionPlan`, and `AdminRole`.
- Shared types also cover `User`, `PrivacyConsent`, `AdminUser`, `AdminAuditLog`, and `UserDeletionRequest`.
- `PrivacyConsent` includes `source: mobile`; `StyleProfile` includes empty placeholder fields for modesty and weather/location preference until full onboarding inputs are designed.
- Lightweight schema metadata exists without adding a validation library.

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

Manual emulator testing is still needed for full signup/login/profile/consent/deletion flows against the Auth and Firestore emulators in an EAS development build.

## Future Architecture Phases

1. Manual emulator/device verification for authentication, profile persistence, consent, and deletion requests.
2. Wardrobe upload and metadata.
3. Weather and occasion context.
4. AI recommendation service boundary.
5. Avatar and virtual try-on architecture.
6. Premium, shopping, and affiliate integrations.
