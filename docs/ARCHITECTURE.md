# GRWM Architecture

## Monorepo Layout

- `apps/mobile`: React Native mobile app placeholder. It must use development builds/EAS Build or a React Native setup that does not require Expo Go.
- `apps/admin`: Next.js admin dashboard placeholder.
- `functions`: Firebase Cloud Functions placeholder.
- `packages/shared`: Shared TypeScript contracts and constants.
- `firebase`: Firestore and Storage security rule placeholders.

## Platform Services

- Firebase Authentication for user identity.
- Cloud Firestore for user profiles, wardrobe metadata, styling context, and admin-visible operational records.
- Firebase Storage for user-uploaded images.
- Firebase Cloud Functions for trusted server-side workflows.

## Privacy First Principles

- Collect only data needed for styling experiences.
- Keep user images in Firebase Storage with user-scoped access.
- Keep personally identifiable data out of logs.
- Require explicit user consent before using sensitive style, body-shape, or image-derived data.

## Future Architecture Phases

1. Authentication and profile persistence.
2. Wardrobe upload and metadata.
3. Weather and occasion context.
4. AI recommendation service boundary.
5. Avatar and virtual try-on architecture.
6. Premium, shopping, and affiliate integrations.
