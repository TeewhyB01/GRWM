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
- Dev-only local mobile QA access harness for Firebase emulator runs, disabled by default and blocked in production/non-demo Firebase config.
- Functions TypeScript build output generation for Firebase emulator definition loading.
- Trusted backend account/data deletion processor with audit logging, status lifecycle tracking, Firestore/Storage/Auth deletion helpers, and emulator-safe unit tests.
- Functions emulator trigger integration for trusted account/data deletion, including completion, controlled failure, idempotency, audit, and unaffected-user checks.
- Wardrobe metadata model.
- Wardrobe onboarding foundation with private setup profile preferences.
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

- Wardrobe onboarding for explicit user-provided category, dress code, formality, colour, modesty, workwear, and occasionwear preferences. Foundation completed on 2026-06-15 without image upload.
- Wardrobe upload security boundary: Storage MIME/size checks, required upload metadata, `wardrobeItems` field validation, consent gates, orphan cleanup plan, and emulator tests. Rule-level boundary completed on 2026-06-15.
- Wardrobe upload lifecycle coordination: Firestore draft first, exact private Storage upload second, trusted backend finalisation third, consent-gated future analysis request helper, and non-destructive orphan detection. Helper/rules coverage and Storage trigger handler QA completed on 2026-06-15; mobile wardrobe onboarding QA and upload UI readiness remain before upload UI.
- User image upload to Firebase Storage after the upload boundary is green.
- Wardrobe item management.
- Weather context integration.
- Occasion-based styling inputs.

Phase 2 status after the 2026-06-15 wardrobe onboarding implementation and Storage trigger QA: onboarding foundation is implemented, setup preferences persist to `wardrobeSetupProfiles/{userId}`, and Wardrobe Home shows a non-upload empty state. Storage trigger registration and backend finalisation lifecycle are covered in emulators with synthetic uploads and finalized handler payloads. Installed-development-build manual QA was attempted on 2026-06-15 but blocked before account creation by Simulator input/focus issues, so the foundation is not manually verified yet. A dev-only local QA access harness now lets emulator testers create a synthetic Auth user without text input, but it does not create wardrobe setup data, wardrobe items, Storage files, or AI jobs. Real wardrobe image upload UI must wait for wardrobe onboarding manual QA, automatic Storage event delivery recheck before production enablement, and explicit approval of non-destructive cleanup/retention operations.

## Phase 3: Intelligence

- AI outfit recommendation service boundary.
- Evaluation and safety checks.
- Multilanguage content strategy.

## Phase 4: Advanced Experiences

- Avatar and virtual try-on architecture.
- Shopping recommendations.
- Premium plans.
- Affiliate revenue workflows.
