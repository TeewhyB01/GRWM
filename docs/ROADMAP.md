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
- Wardrobe metadata model.
- Firestore and Storage ownership rules.
- Firebase emulator and rules test setup.
- Local emulator seed helpers for synthetic users and admin roles.

## Phase 1 Remaining Verification

- Execute the `docs/MOBILE_EMULATOR_QA.md` checklist in an installed EAS development build.
- Install `com.grwm.mobile` on the target simulator/device before rerunning the manual emulator checklist.
- 2026-06-14 verification prep confirmed isolated emulators and Metro work, but the iOS simulator still lacks the GRWM development build.
- 2026-06-14 build installer prep added `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md`; remaining verification depends on successfully installing `com.grwm.mobile`.
- Manual EAS development-build testing for signup/login/logout/auth persistence.
- Manual Auth and Firestore emulator testing for profile creation, consent capture/update, and deletion request creation.
- Functions emulator tests for future trusted consent and deletion processors.

## Phase 2: Wardrobe And Context

- User image upload to Firebase Storage.
- Wardrobe item management.
- Weather context integration.
- Occasion-based styling inputs.

## Phase 3: Intelligence

- AI outfit recommendation service boundary.
- Evaluation and safety checks.
- Multilanguage content strategy.

## Phase 4: Advanced Experiences

- Avatar and virtual try-on architecture.
- Shopping recommendations.
- Premium plans.
- Affiliate revenue workflows.
