# Mobile Wardrobe Onboarding QA Report

Date/time: 2026-06-15 13:21:46 BST

## Scope

Manual QA was attempted for the wardrobe onboarding foundation on the installed `com.grwm.mobile` iOS development build against Firebase emulators. Expo Go was not used. No image picker, Firebase Storage upload UI, AI, avatar, payment, shopping, or affiliate work was built.

## Target

- Simulator: iPhone 17
- iOS: 26.5
- Simulator UDID: `869FD156-3EC8-4547-885A-17708718D606`
- App: installed `com.grwm.mobile` development build
- Metro: `http://127.0.0.1:8081`

## Emulator Ports

- Emulator UI: `127.0.0.1:4001`
- Auth: `127.0.0.1:9100`
- Firestore: `127.0.0.1:8085`
- Functions: `127.0.0.1:5002`
- Storage: `127.0.0.1:9195`
- Emulator hub: `127.0.0.1:4410`
- Logging: `127.0.0.1:4505`
- Firestore websocket: `127.0.0.1:9150`

## Test Account

- Intended email pattern: `grwm-wardrobe-qa-20260615-<timestamp>@example.test`
- Password: not recorded in this report
- Account creation was not completed because the manual flow was blocked before credential entry.

## Manual Result

Manual QA was attempted but not completed. The installed development build was present, isolated Firebase emulators started, Metro started, and the app launched through the development client URL. After resetting simulator app data by reinstalling the already-installed development build artifact, the app reached the unauthenticated Welcome screen.

The full A-J wardrobe onboarding flow could not be completed because desktop Simulator input/focus automation became unreliable and blocked account creation. The manual wardrobe onboarding foundation is therefore not verified by this run.

## A-J Checklist

| Step | Result | Notes |
| --- | --- | --- |
| A. Fresh auth state | Blocked after partial verification | Fresh reinstall reached the unauthenticated Welcome screen. Test account creation/sign-in and protected-screen verification were blocked by Simulator input/focus issues. |
| B. Wardrobe setup entry | Not run | Requires signed-in test account. |
| C. Privacy explainer | Not run | Requires signed-in test account and wardrobe setup navigation. |
| D. Category preferences | Not run | Requires setup flow access. |
| E. Style basics | Not run | Requires setup flow access. |
| F. Summary and save | Not run | No `wardrobeSetupProfiles/{uid}` document was created by manual app QA. |
| G. Wardrobe home empty state | Not run | Requires completed or resumed setup state. |
| H. Persistence check | Not run | Requires completed setup state. |
| I. Settings/privacy alignment | Not run | Requires signed-in test account. |
| J. Signed-out protection | Not run | Only the unauthenticated Welcome state was observed after reset. |

## Firestore Verification

- Manual `wardrobeSetupProfiles/{uid}` document observed: none.
- Manual `wardrobeItems` image-backed records observed: none.
- Manual AI job records observed: none.
- Cross-user manual spot check: not run.
- Rule-test coverage: Firestore rules tests passed and cover own missing reads, own create/update, cross-user denial, enum validation, immutable owner/source/createdAt constraints, and unauthenticated denial for `wardrobeSetupProfiles/{uid}`.

## Storage And AI Confirmation

- No Firebase Storage upload was attempted from the mobile app during this manual run.
- Focused mobile scan found no image picker or Firebase Storage client upload path in `apps/mobile`.
- Storage rules tests intentionally exercise synthetic emulator Storage writes; those are test-only and not mobile app uploads.
- No AI job was created during manual app QA.
- Focused mobile scan found no AI provider call or wardrobe analysis dispatch from the mobile client.

## Screenshots And Notes

Simulator screenshots from the attempted run were captured under `/tmp/grwm-wardrobe-qa/`. Host desktop screenshots were removed from that directory. The useful manual evidence is limited to app launch, development-client loading, and unauthenticated Welcome state after app-data reset.

## Fixes Made

None. The blocker was environmental/manual-input related rather than a product code failure observed inside the wardrobe onboarding flow.

## Safety Scan

- No tracked `.env.local` file was found.
- Firebase key scan found environment variable names and demo placeholder values only.
- Mobile image picker/Storage scan found no `ImagePicker`, `launchImageLibrary`, `launchCamera`, `firebase/storage`, `getStorage`, `uploadBytes`, `uploadString`, or `putFile` usage.
- Mobile AI/avatar/payment/shopping/affiliate scan found only privacy consent field references for `avatarCreation`; no feature implementation or provider call was found.
- Mobile wardrobe lifecycle scan found setup/profile writes and tests asserting setup payloads do not include `storagePath`, `uploadStatus`, or `analysisStatus`.
- `npm`/`npx`/Expo Go scan found expected documentation and tests saying Expo Go is unsupported and pnpm must be used.

## Commands Run

- `pnpm qa:mobile:emulators:isolated`: started isolated Auth, Firestore, Storage, Functions, UI, hub, logging, and websocket emulators.
- `pnpm mobile:start:dev-client`: started Metro for the installed development build.
- `xcrun simctl get_app_container booted com.grwm.mobile app`: confirmed the development build was installed.
- `xcrun simctl launch booted com.grwm.mobile`: launched the installed app.
- `xcrun simctl openurl booted exp+grwm://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`: loaded the Metro bundle through the development client.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `pnpm test:firestore-rules`: first parallel attempt failed because the emulator hub port was already in use by a concurrent Storage rules run; rerun sequentially passed.
- `pnpm test:storage-rules`: passed.
- `pnpm test:firebase-rules`: passed.
- `pnpm --filter mobile typecheck`: passed.
- `pnpm --filter mobile test`: passed.
- `pnpm --filter functions typecheck`: passed.
- `pnpm --filter functions build`: passed.
- `pnpm --filter admin typecheck`: passed.

## Blockers

- Desktop Simulator input/focus automation became unreliable and prevented creation/sign-in of the test account.
- Because the account could not be created, the protected wardrobe setup flow and A-J checks were not manually verified.

## Verification Decision

Wardrobe onboarding foundation is implemented and automated checks are green, but it is not manually verified by this run.

The project is not ready to treat wardrobe onboarding as having passed installed-development-build manual QA. Storage trigger integration QA can proceed as a backend/emulator task, but real wardrobe image upload UI should remain blocked until wardrobe onboarding manual QA and full Storage trigger integration QA both pass.

Next recommended agent: Mobile Wardrobe Manual QA Rerun Agent on a clean, controllable simulator or physical device, followed by the Upload UI Readiness Agent after the onboarding manual gate passes.
