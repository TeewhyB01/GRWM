# GRWM Mobile

Expo React Native shell for the GRWM mobile app.

## Mobile Path Decision

- Use Expo React Native.
- Use EAS development builds.
- Use `expo-dev-client` when the app is scaffolded.
- Do not use Expo Go.
- Do not use npm.
- Use pnpm only.

## Future Commands

```bash
pnpm --filter mobile expo start --dev-client
pnpm --filter mobile eas build --profile development --platform ios
pnpm --filter mobile eas build --profile development --platform android
```

Local package scripts can also run as:

```bash
pnpm --filter mobile start
pnpm --filter mobile eas:build:ios
pnpm --filter mobile eas:build:android
pnpm --filter mobile typecheck
```

## Phase 1 Screens

- Welcome
- Login
- Sign Up
- Language Selection
- Country Selection
- Onboarding Start
- Wardrobe Home
- Today's Outfit
- Settings
