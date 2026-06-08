# GRWM

GRWM stands for Get Ready With Me. This repository is the monorepo foundation for a global, privacy-first AI fashion styling platform.

## Current Scope

This foundation includes workspace wiring, TypeScript configuration, placeholder app packages, Firebase rule placeholders, and planning documents. It does not implement AI recommendations, avatars, payments, affiliate shopping, or production Firebase logic yet.

## Project Structure

```text
apps/
  mobile/     React Native mobile app placeholder
  admin/      Next.js admin dashboard placeholder
functions/   Firebase Cloud Functions placeholder
packages/
  shared/     Shared TypeScript contracts
docs/         Product and engineering planning docs
firebase/     Firestore and Storage rule placeholders
```

## Rules

- Use pnpm only.
- Do not use npm.
- Do not rely on Expo Go.
- Mobile development should use Expo development builds/EAS Build or a React Native setup that does not require Expo Go.
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

1. Choose the exact React Native setup for `apps/mobile`.
2. Scaffold the Next.js admin dashboard in `apps/admin`.
3. Configure Firebase projects and local emulator workflows.
4. Add authentication, data models, and privacy controls before any AI features.
