# GRWM Test Plan

## Foundation Test Gates

- `pnpm typecheck`: validates TypeScript contracts and placeholder package code.
- `pnpm lint`: validates TypeScript and TSX linting rules across workspace packages.
- `pnpm test`: runs unit tests for shared, mobile, admin, Functions placeholders, and deletion processor helpers.
- `pnpm test:firestore-rules`: runs Firestore rules tests through the Firebase Emulator Suite.
- `pnpm test:storage-rules`: runs Storage rules tests through the Firebase Emulator Suite.
- `pnpm test:firebase-rules`: runs both Firestore and Storage rules suites.
- `pnpm --filter mobile typecheck`: validates the Expo React Native shell.
- `pnpm --filter mobile test`: runs mobile Node tests for auth routing, Firebase emulator config helpers, privacy consent helpers, and profile/deletion payload builders.
- `pnpm --filter admin typecheck`: validates the Next.js admin shell.
- `pnpm --filter functions typecheck`: validates Firebase Functions placeholder exports.
- `pnpm --filter functions build`: emits Firebase Functions definitions to `functions/lib/index.js`.
- `pnpm functions:build`: root alias for the Functions build required before Functions emulator definition loading.
- `pnpm qa:mobile:eas:config`: validates local EAS development-build config assertions without starting a cloud build or requiring an Expo account.
- `pnpm qa:mobile:install-check`: confirms `com.grwm.mobile` is installed on the booted iOS simulator.
- `pnpm qa:mobile:emulators:isolated`: starts mobile Auth, Firestore, Storage, and Functions emulators on conflict-free local ports when another project owns the standard Firebase ports.

## Phase 1 Shell Coverage

- Mobile route registry includes all entry, onboarding, privacy, and main screens.
- Mobile i18n starts with English resources and theme tokens.
- Admin route registry includes protected operational pages.
- Admin protected-route placeholder allows shell development before Firebase custom claims.
- Shared schemas validate required model fields without external validation dependencies.
- Functions tests assert placeholder exports remain inactive and explicit, and validate backend deletion processor helper behavior.

## Firebase Auth And Privacy/Data Model Coverage

- Shared tests validate Firestore collection constants, model schemas, privacy consent defaults, admin roles, and Storage path helpers.
- Mobile tests validate Firebase client env detection, Auth user mapping, protected route helpers, profile default builders, privacy consent validation, deletion request validation, consent feature gates, style placeholders, and the AsyncStorage Auth persistence adapter.
- Mobile tests also validate local emulator placeholder config, consent-required route decisions before protected screens, Settings consent choice merging, and privacy-first deletion request payloads.
- Admin tests validate Firebase client env detection, placeholder login, and route role checks.
- Functions tests validate runtime config helpers, auth/privacy placeholder registration, auth/privacy request contracts, deletion status helpers, Firestore deletion target selection, Storage deletion prefix selection, audit log payload shape, Auth user-not-found handling, and a fake-dependency deletion processor run.

## Firebase Emulator Rules Coverage

- Firestore owner access for each user-owned collection.
- Firestore denial across users.
- Standard-user denial for admin collections.
- Storage owner access for each private path.
- Storage denial across users and public requests.
- User deletion request creation ownership.
- User deletion request status reads by owner.
- Client denial for backend-owned deletion status updates.

## Firebase Emulator Tests Needed Next

- Admin allow-path coverage through `adminUsers` role records.
- User deletion request status transition rules.
- Firestore field-level validation for sensitive data.
- Storage MIME type, size, and moderation checks.
- Full Functions emulator trigger tests for auth/privacy workflows.
- Full Functions emulator trigger tests for `userDataDeletion`.

## Manual Mobile Testing Needed Next

- Follow `docs/MOBILE_EMULATOR_QA.md`.
- Use `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md` to create and install a development build before rerunning A-G manual QA on a fresh simulator/device.
- 2026-06-08 prep result: emulator and Metro setup completed, but manual A-G flow was blocked because no `com.grwm.mobile` development build was installed on the booted iOS simulator.
- 2026-06-14 prep result: isolated emulators and Metro started successfully on iPhone 17 simulator target, but manual A-G flow was blocked again because `com.grwm.mobile` was not installed.
- 2026-06-14 build installer prep added pnpm scripts for local/EAS development-build install paths and Functions build output generation.
- 2026-06-14 actual run result: A-G mobile manual emulator QA passed on iPhone 17 simulator, iOS 26.5, with the installed `com.grwm.mobile` development build.
- Verified on emulators: signup with email/password, auth persistence after app restart, login/logout, consent-required redirect before protected screens, signed-out protection, signup-created `users/{uid}` and `userProfiles/{uid}`, initial `privacyConsents/{uid}` with `source: mobile`, Settings consent updates, and `userDeletionRequests/{uid}` creation.
- Small QA blockers fixed: Firebase Auth AsyncStorage persistence class shape and Firestore owner-keyed missing-document reads for first-run consent/deletion checks.
- Manual evidence and emulator document snapshots: `docs/MOBILE_MANUAL_QA_REPORT.md`.
- Next manual rerun should use a new synthetic account and confirm the same A-G flow after any navigation, auth, profile, privacy, or rules changes.

## Known Limitations

- Mobile emulator QA must be rerun manually in an installed development build after auth/profile/privacy/navigation changes.
- Check `xcrun simctl get_app_container booted com.grwm.mobile app` before starting iOS simulator manual QA.
- `pnpm qa:mobile:install-check` runs the same iOS simulator app-container check.
- If standard emulator ports are occupied, use `pnpm qa:mobile:emulators:isolated` and point `apps/mobile/.env.local` at Auth `9100` and Firestore `8085`.
- The local EAS config validation command does not create a build artifact; the EAS CLI config command still requires an Expo account or `EXPO_TOKEN`.
- EAS cloud simulator builds require Expo login or `EXPO_TOKEN`; local simulator builds require working Xcode simulator tooling.
- Account/data deletion is requested by the mobile client and processed by the trusted backend `userDataDeletion` trigger. Full Functions emulator trigger integration still needs to be added before production data collection.

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
