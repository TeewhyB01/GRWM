# GRWM

GRWM stands for Get Ready With Me. This repository is the monorepo foundation for a global, privacy-first AI fashion styling platform.

## Current Scope

This foundation includes workspace wiring, TypeScript configuration, Expo and Next.js app shells, Firebase Auth/profile persistence, privacy consent capture, a trusted deletion processor, Firebase rules and emulator tests, and planning documents. It does not implement wardrobe upload, AI recommendations, avatars, payments, or affiliate shopping yet.

## Project Structure

```text
apps/
  mobile/     Expo React Native app using EAS development builds
  admin/      Next.js admin dashboard shell with placeholder auth
functions/   Firebase Cloud Functions placeholders plus trusted deletion trigger
packages/
  shared/     Shared TypeScript contracts
docs/         Product and engineering planning docs
firebase/     Firestore and Storage rules plus emulator tests
```

## Rules

- Use pnpm only.
- Do not use npm.
- Do not rely on Expo Go.
- Mobile development uses Expo React Native with EAS development builds.
- Expo Go is not a supported runtime for this project.
- Use TypeScript throughout.
- Use Firebase Authentication, Cloud Firestore, Firebase Storage, and Firebase Cloud Functions.
- Keep the product privacy-first.

## Commands

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## Next Engineering Milestones

1. Harden wardrobe upload Storage and Firestore boundaries.
2. Build wardrobe onboarding from explicit user-provided preferences.
3. Implement wardrobe upload only after upload rules and emulator tests are green.
4. Replace admin placeholder auth with Firebase Auth, trusted role issuance, and first-owner bootstrap.
