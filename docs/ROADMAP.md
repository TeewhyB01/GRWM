# GRWM Roadmap

## Phase 0: Foundation

- Monorepo setup.
- pnpm workspace configuration.
- TypeScript, lint, and test gates.
- Placeholder mobile, admin, functions, shared, docs, and Firebase rules.

## Phase 1: Core Platform

- Expo React Native app shell with EAS development builds and `expo-dev-client`.
- Mobile navigation shell, English i18n resources, and light/dark theme tokens.
- Next.js admin shell with protected-route placeholders and operational routes.
- Firebase Functions placeholder exports for deferred workflows.
- Shared TypeScript domain contracts.
- Firebase project setup.
- Firebase Auth email/password foundation.
- Mobile Firebase Auth email/password signup, login, logout, auth-state listener, protected navigation, and persisted auth state.
- User profile model and mobile signup-created `users/{uid}` / `userProfiles/{uid}` documents.
- Privacy and consent model with mobile consent capture, settings updates, and deletion request creation.
- Mobile emulator QA documentation, safe demo env placeholders, configurable Auth/Firestore emulator hosts, and EAS development-build validation scripts.
- Mobile native development-build identifiers and isolated emulator config for port-conflict QA.
- Mobile development-build installer scripts and documentation for iOS simulator, Android emulator, EAS simulator builds, Metro dev-client start, and installed app checks.
- Functions TypeScript build output generation for Firebase emulator definition loading.
- Trusted backend account/data deletion processor with audit logging, status lifecycle tracking, Firestore/Storage/Auth deletion helpers, and emulator-safe unit tests.
- Functions emulator trigger integration for trusted account/data deletion, including completion, controlled failure, idempotency, audit, and unaffected-user checks.
- Wardrobe metadata model.
- Firestore and Storage ownership rules.
- Firebase emulator and rules test setup.
- Local emulator seed helpers for synthetic users and admin roles.

## Phase 1 Verification Status

- 2026-06-14 earlier verification prep confirmed isolated emulators and Metro worked, but was blocked before the development build was installed.
- 2026-06-14 build installer prep added `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md` and enabled installing `com.grwm.mobile`.
- 2026-06-14 installed development-build verification passed: the `docs/MOBILE_EMULATOR_QA.md` A-G checklist ran on iPhone 17 simulator, iOS 26.5, using `com.grwm.mobile` and isolated Firebase emulators.
- Verified on the installed development build: signup, login/logout, auth persistence, protected-route gating, profile creation, privacy consent capture, Settings consent updates, and deletion request creation.
- Fixed during verification: Firebase Auth AsyncStorage persistence adapter shape and Firestore missing-own-document reads for first-run privacy/deletion checks.
- Continue to rerun the manual emulator checklist after any auth, profile, privacy, navigation, or rules changes.
- Functions helper tests and full Functions emulator trigger integration now cover trusted deletion processing. Keep `pnpm qa:deletion:functions-emulator` green before production data collection.

## Phase 2: Wardrobe And Context

- Wardrobe onboarding for explicit user-provided style, fit, modesty, and context preferences.
- Wardrobe upload security boundary: Storage MIME/size checks, required upload metadata, `wardrobeItems` field validation, consent gates, orphan cleanup plan, and emulator tests. Rule-level boundary completed on 2026-06-15; upload lifecycle coordination and mobile QA remain before upload UI.
- User image upload to Firebase Storage after the upload boundary is green.
- Wardrobe item management.
- Weather context integration.
- Occasion-based styling inputs.

Phase 2 entry status after the 2026-06-15 architecture review: onboarding foundation can begin, but wardrobe upload must wait for the upload security boundary and tests in `docs/ARCHITECTURE_REVIEW.md`.

## Phase 3: Intelligence

- AI outfit recommendation service boundary.
- Evaluation and safety checks.
- Multilanguage content strategy.

## Phase 4: Advanced Experiences

- Avatar and virtual try-on architecture.
- Shopping recommendations.
- Premium plans.
- Affiliate revenue workflows.
