# GRWM Test Plan

## Foundation Test Gates

- `pnpm typecheck`: validates TypeScript contracts and placeholder package code.
- `pnpm lint`: validates TypeScript and TSX linting rules across workspace packages.
- `pnpm test`: runs unit tests for shared, mobile, admin, and functions placeholders.
- `pnpm --filter mobile typecheck`: validates the Expo React Native shell.
- `pnpm --filter admin typecheck`: validates the Next.js admin shell.
- `pnpm --filter functions typecheck`: validates Firebase Functions placeholder exports.

## Phase 1 Shell Coverage

- Mobile route registry includes all entry, onboarding, and main placeholder screens.
- Mobile i18n starts with English resources and theme tokens.
- Admin route registry includes protected operational pages.
- Admin protected-route placeholder allows shell development before Firebase custom claims.
- Shared schemas validate required model fields without external validation dependencies.
- Functions tests assert placeholder exports remain inactive and explicit.

## Firebase Auth And Privacy/Data Model Coverage

- Shared tests validate Firestore collection constants, model schemas, privacy consent defaults, admin roles, and Storage path helpers.
- Mobile tests validate Firebase client env detection, Auth user mapping, and protected route helpers.
- Admin tests validate Firebase client env detection, placeholder login, and route role checks.
- Functions tests validate runtime config helpers and auth/privacy placeholder registration.

## Firebase Emulator Tests Needed Next

- Firestore owner access for each user-owned collection.
- Firestore denial across users.
- Admin collection access through `adminUsers` role records.
- Storage owner access for each private path.
- Storage denial across users and public requests.
- User deletion request creation and status transition rules.

## MVP Test Areas

- Authentication flows.
- Wardrobe item create, update, delete, and listing.
- Firebase Storage upload authorization.
- Firestore rule coverage.
- Admin dashboard role checks.
- User privacy and deletion flows.

## Future Test Areas

- AI recommendation quality and safety.
- Avatar and virtual try-on consent boundaries.
- Payment and subscription state.
- Shopping and affiliate disclosure.
- Multilanguage behavior and locale fallback.
