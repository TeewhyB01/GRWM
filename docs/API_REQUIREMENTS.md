# GRWM API Requirements

## Foundation APIs

The foundation does not expose production APIs yet. Firebase Cloud Functions will host trusted server-side endpoints when the data model is ready.

## Phase 1 Function Placeholders

- `wardrobeAnalysis`: reserved for future wardrobe image and metadata analysis.
- `dailyOutfitRecommendation`: reserved for future weather-aware daily styling.
- `occasionOutfitRecommendation`: reserved for future occasion-based styling.
- `avatarGenerationRequest`: reserved for future avatar workflow requests.
- `userDataDeletion`: reserved for authenticated privacy deletion workflows.
- `affiliateClickTracking`: reserved for future affiliate attribution.
- `subscriptionWebhook`: reserved for future payment provider webhook handling.
- `createUserProfileOnSignup`: reserved for creating default user/profile/consent records after Auth sign-up.
- `requestUserDataDeletion`: reserved for authenticated account deletion requests.
- `logAdminAction`: reserved for admin audit logging.
- `recordPrivacyConsent`: reserved for versioned consent writes.
- `validateAdminRole`: reserved for trusted admin role validation.

All placeholders must return or emit explicit not-implemented responses and must not call external APIs in Phase 1.

## Future API Areas

- Authentication-aware user profile APIs.
- Wardrobe item creation, update, delete, and listing.
- Image upload coordination with Firebase Storage.
- Styling context APIs for weather, occasion, and preferences.
- Admin dashboard APIs with role-based access.
- User data deletion and export APIs.
- Admin audit and moderation APIs.

## API Principles

- Require Firebase Authentication for user-owned data.
- Validate all inputs at the server boundary.
- Keep server responses minimal.
- Do not expose private Storage paths without authorization.
- Log operational metadata only, never raw personal styling inputs or image contents.
- Keep consent and deletion endpoints idempotent where practical.
