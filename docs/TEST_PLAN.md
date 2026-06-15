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
- `pnpm test:functions-emulator`: builds Functions, confirms `functions/lib/index.js`, starts Auth/Firestore/Storage/Functions emulators, and runs deletion trigger integration.
- `pnpm test:deletion-trigger`: alias for deletion trigger integration.
- `pnpm qa:deletion:functions-emulator`: QA alias for deletion trigger integration.
- `pnpm test:storage-trigger`: builds Functions, confirms `functions/lib/index.js`, starts isolated Auth/Firestore/Storage/Functions emulators, and runs wardrobe upload trigger handler integration.
- `pnpm test:wardrobe-upload-trigger`: alias for wardrobe upload trigger handler integration.
- `pnpm qa:wardrobe-upload:functions-emulator`: QA alias for wardrobe upload trigger handler integration.
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

- Shared tests validate Firestore collection constants, model schemas, rejection of incomplete required payloads, privacy consent defaults, admin roles, and Storage path helpers.
- Mobile tests validate Firebase client env detection, Auth user mapping, protected route helpers, profile default builders, privacy consent validation, deletion request validation, consent feature gates, style placeholders, wardrobe setup payload builders, wardrobe onboarding i18n keys, and the AsyncStorage Auth persistence adapter.
- Mobile tests also validate local emulator placeholder config, consent-required route decisions before protected screens, Settings consent choice merging, privacy-first deletion request payloads, and the dev-only local QA access harness.
- Local QA access tests cover disabled-by-default behavior, development/emulator-only enablement, production runtime blocking, production Firebase config blocking, generated local credentials, required `users/{uid}` and `userProfiles/{uid}` creation, optional-only privacy consent creation, and no `wardrobeSetupProfiles`, `wardrobeItems`, Storage upload, or AI job actions.
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
- Storage upload MIME type, max file size, required owner metadata, required path ID metadata, unauthenticated denial, cross-user denial, broad list denial, generated avatar client-write denial, and owner delete policy.
- Firestore `wardrobeItems` required fields, owner consistency, immutable owner/path/source fields, allowed category/source/status values, private visibility, backend-owned upload lifecycle field denial, backend-owned analysis field denial, and valid non-AI user updates.
- Firestore `wardrobeSetupProfiles` ownership, missing-own-document reads, required fields, status/source/category/style enum validation, immutable owner fields, unauthenticated denial, and valid completion updates.
- Shared upload policy constants, private path builders, invalid path IDs, consent gates, wardrobe upload draft creation, metadata validation, backend-owned field detection, upload failure payloads, and wardrobe item schema validation.
- Shared wardrobe setup profile validation, category preference validation, and style basics validation.
- Functions helper tests for wardrobe upload finalisation, including valid Storage object finalisation, metadata mismatch, missing Firestore record, user mismatch, invalid content type, oversized object, and consent-blocked analysis requests.
- Storage trigger handler integration verifies Functions emulator registration, private wardrobe path filtering, valid upload finalisation, missing analysis consent, metadata mismatch, missing record, cross-user collision protection, unsafe object rejection, idempotency, ignored non-wardrobe paths, audit logs, and no AI job creation.

## Firebase Emulator Tests Needed Next

- Admin allow-path coverage through `adminUsers` role records.
- Firestore field-level validation for sensitive non-wardrobe collections.
- Storage moderation/malware checks and byte-level content verification before production wardrobe upload.
- Full Functions emulator trigger tests for future auth/privacy workflows beyond deletion.
- Additional production-like deletion failure tests for Firestore or Storage outages. Current trigger integration forces an Auth deletion failure safely inside emulators.
- Recheck automatic v2 Storage finalize event delivery when Firebase Tools/runtime versions change. Current QA uploads to the Storage emulator and invokes the registered handler with finalized payloads because local emulator writes did not auto-deliver events.
- Destructive orphan cleanup tests remain future work; current orphan detection is non-destructive.

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
- Wardrobe onboarding manual QA should also verify Intro, Privacy Explainer, Category Preferences, Style Basics, Summary, and Wardrobe Home empty state using an installed development build. Confirm the "Add wardrobe item soon" CTA is disabled and no image picker or Storage upload occurs.
- 2026-06-15 wardrobe onboarding run result: isolated emulators, Metro, and the installed `com.grwm.mobile` development build launched on iPhone 17 simulator, iOS 26.5. After app-data reset the unauthenticated Welcome state appeared, but the A-J wardrobe onboarding flow was blocked before account creation by desktop Simulator input/focus issues. Evidence: `docs/MOBILE_WARDROBE_ONBOARDING_QA_REPORT.md`.
- A dev-only local QA access harness now exists to avoid simulator text input for account creation. Enable it only in ignored local env with `GRWM_ENABLE_QA_ACCESS=true` and `EXPO_PUBLIC_GRWM_ENABLE_QA_ACCESS=true` while using the demo Firebase emulator config. It is hidden by default, hidden outside emulator mode, hidden in production runtime, and hidden for non-`demo-grwm` Firebase config.
- The next wardrobe onboarding manual rerun should tap "Continue with local QA account", save privacy consent through the app UI, then complete the wardrobe onboarding screens. The harness must not skip the wardrobe setup screens, and `wardrobeSetupProfiles/{uid}` must appear only after the setup flow saves it.

## Known Limitations

- Mobile emulator QA must be rerun manually in an installed development build after auth/profile/privacy/navigation changes.
- Check `xcrun simctl get_app_container booted com.grwm.mobile app` before starting iOS simulator manual QA.
- `pnpm qa:mobile:install-check` runs the same iOS simulator app-container check.
- If standard emulator ports are occupied, use `pnpm qa:mobile:emulators:isolated` and point `apps/mobile/.env.local` at Auth `9100` and Firestore `8085`.
- Local QA access is not a production feature. Confirm it is disabled by default before release-facing runs by setting both QA flags to `false`, restarting Metro, and checking that Welcome/Login do not show the local QA button.
- The local EAS config validation command does not create a build artifact; the EAS CLI config command still requires an Expo account or `EXPO_TOKEN`.
- EAS cloud simulator builds require Expo login or `EXPO_TOKEN`; local simulator builds require working Xcode simulator tooling.
- Account/data deletion is requested by the mobile client and processed by the trusted backend `userDataDeletion` trigger. Full Functions emulator trigger integration exists and must stay green before production data collection.
- Architecture review status on 2026-06-15 remains amber. Wardrobe onboarding foundation work can proceed.
- Wardrobe onboarding foundation, setup profile rules, upload-security rule constraints, `wardrobeItems` validation, shared lifecycle helpers, consent-blocked analysis decisions, backend finalisation helpers, non-destructive orphan detection, and wardrobe trigger handler QA are now implemented and tested. The 2026-06-15 installed-development-build wardrobe onboarding manual run was blocked before account creation, so real wardrobe upload UI remains blocked until wardrobe onboarding manual QA passes and upload UI readiness is separately approved.

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
