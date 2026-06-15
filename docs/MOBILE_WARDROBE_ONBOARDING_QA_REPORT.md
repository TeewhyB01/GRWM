# Mobile Wardrobe Onboarding QA Report

Date/time: 2026-06-15 16:43:05 BST

## Scope

Manual QA was rerun for the wardrobe onboarding foundation on an installed `com.grwm.mobile` iOS development build against Firebase emulators. Expo Go was not used. No image picker, Firebase Storage upload UI, AI, avatar, payment, shopping, affiliate, or upload work was built.

This rerun focused on finding a controllable manual QA route after the previous iPhone 17 Simulator input/focus blocker. A fresh Route A simulator was created and the installed development build launched successfully, but manual input still could not be controlled reliably enough to complete account creation or the wardrobe onboarding A-J flow.

## Target

- Route attempted: Route A, cleaner iOS simulator.
- Simulator: `GRWM Wardrobe QA iPhone 16`
- iOS: 26.5
- Simulator UDID: `9D80B63A-D2F4-4C73-8962-754514A862AE`
- App: installed `com.grwm.mobile` development build copied from the already-installed simulator build bundle.
- Metro: `http://127.0.0.1:8081`
- Expo Go: not used.

## Emulator Ports

- Emulator UI: `127.0.0.1:4001`
- Auth: `127.0.0.1:9100`
- Firestore: `127.0.0.1:8085`
- Functions: `127.0.0.1:5002`
- Storage: `127.0.0.1:9195`
- Emulator hub: `127.0.0.1:4410`
- Logging: `127.0.0.1:4505`
- Firestore websocket: `127.0.0.1:9150`

## Environment Preparation

- `pnpm` was not on PATH, so the documented fallback pnpm was used with the bundled Codex Node runtime on PATH.
- `apps/mobile/.env.local` already pointed the app at isolated Auth `9100` and Firestore `8085`.
- `pnpm qa:mobile:emulators:isolated` started Auth, Firestore, Storage, Functions, Emulator UI, hub, logging, and Firestore websocket services.
- `pnpm mobile:start:dev-client` started Metro and loaded the isolated emulator env values.
- The iPhone 16 simulator was created with `xcrun simctl create`, booted, and had `com.grwm.mobile` installed with `xcrun simctl install`.
- The installed development build launched and loaded the Metro bundle via the development-client URL.

## Test Account

- Account type: none created.
- Seeded account: not used.
- Fresh account: not created.
- Reason: manual input/tap control remained unreliable before account creation.

## Manual Result

Manual QA was attempted but not completed. The fresh iPhone 16 simulator, isolated Firebase emulators, Metro, and installed `com.grwm.mobile` development build all launched successfully. The app reached the unauthenticated Welcome screen in the installed development build.

The A-J wardrobe onboarding flow could not be completed because desktop input/focus control did not reliably reach the Simulator window. Attempts included a fresh simulator, app relaunch to clear the dev-client menu, Simulator window repositioning through accessibility, AppleScript click/key events, CoreGraphics click events, Space switching attempts, and checking for physical-device or native simulator input tooling. A physical iPhone was visible to Xcode but offline, so Route C was not available. No product bug was confirmed inside the wardrobe onboarding flow.

## A-J Checklist

| Step | Result | Notes |
| --- | --- | --- |
| A. Fresh auth state | Blocked after partial verification | Fresh simulator and installed dev build reached the unauthenticated Welcome screen. Account creation/sign-in was blocked by desktop Simulator input/focus control. |
| B. Wardrobe setup entry | Not run | Requires signed-in account and controllable UI input. |
| C. Privacy explainer | Not run | Requires signed-in account and wardrobe setup navigation. |
| D. Category preferences | Not run | Requires setup flow access. |
| E. Style basics | Not run | Requires setup flow access. |
| F. Summary and save | Not run | No `wardrobeSetupProfiles/{uid}` document was created by manual app QA. |
| G. Wardrobe home empty state | Not run | Requires completed or resumed setup state. |
| H. Persistence check | Not run | Requires completed setup state. |
| I. Settings/privacy alignment | Not run | Requires signed-in account. |
| J. Signed-out protection | Not run | Only unauthenticated Welcome state was observed. |

## Firestore Verification

Emulator-admin inspection after the attempted run observed:

- `users`: 0 documents.
- `userProfiles`: 0 documents.
- `privacyConsents`: 0 documents.
- `wardrobeSetupProfiles`: 0 documents.
- `wardrobeItems`: 0 documents.
- `styleProfiles`: 0 documents.
- `outfitRecommendations`: 0 documents.
- `avatarProfiles`: 0 documents.
- `subscriptions`: 0 documents.
- `userDeletionRequests`: 0 documents.
- Auth emulator users: 0.

No `wardrobeSetupProfiles/{uid}` document exists because the manual flow did not reach account creation or setup completion.

## Storage And AI Confirmation

- Firebase Storage emulator files observed: 0.
- No Storage upload was attempted from the mobile app during this rerun.
- No image-backed `wardrobeItems` records were created.
- No `outfitRecommendations` records were created.
- The current shared collection constants do not include a live `aiJobs` collection; future `aiJobs` remains listed only in future collection planning.
- No AI analysis job or recommendation-side document was created during manual app QA.

## Input/Focus Workarounds Attempted

- Created and booted fresh `GRWM Wardrobe QA iPhone 16` simulator.
- Installed `com.grwm.mobile` onto the fresh simulator from the existing installed development-build bundle.
- Launched the installed development build directly with `xcrun simctl launch`.
- Loaded Metro through `exp+grwm://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`.
- Accepted the dev-client open flow and relaunched the app to clear the dev menu.
- Moved the Simulator window through macOS accessibility APIs.
- Tried AppleScript click/key events.
- Tried CoreGraphics click events.
- Tried macOS Space switching events.
- Checked for Appium, idb, applesimutils, WebDriverAgent, and native simulator tap helpers; none were available.
- Checked for a physical iPhone; Xcode listed `Olutayo's Iphone` as offline.

## Fixes Made

None. The blocker remained environmental/manual-input related. No app-side keyboard, route, save, Firestore path, setup status, validation, i18n, stale copy, Storage, or AI product bug was confirmed.

## Safety Scan

- Expo Go was not used.
- No `.env.local` file was modified or committed.
- No image picker was added or used.
- No Firebase Storage upload path was added or used.
- No AI, avatar, payment, shopping, affiliate, or upload UI work was built.

## Commands Run

- `xcrun simctl create "GRWM Wardrobe QA iPhone 16" com.apple.CoreSimulator.SimDeviceType.iPhone-16 com.apple.CoreSimulator.SimRuntime.iOS-26-5`
- `xcrun simctl boot 9D80B63A-D2F4-4C73-8962-754514A862AE`
- `xcrun simctl install 9D80B63A-D2F4-4C73-8962-754514A862AE <installed GRWM.app bundle>`
- `xcrun simctl get_app_container 9D80B63A-D2F4-4C73-8962-754514A862AE com.grwm.mobile app`
- `pnpm qa:mobile:emulators:isolated` with fallback pnpm and bundled Node runtime.
- `pnpm mobile:start:dev-client` with fallback pnpm and bundled Node runtime.
- `xcrun simctl launch 9D80B63A-D2F4-4C73-8962-754514A862AE com.grwm.mobile`
- `xcrun simctl openurl 9D80B63A-D2F4-4C73-8962-754514A862AE exp+grwm://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`
- `xcrun simctl io ... screenshot ...`
- `xcrun xctrace list devices`
- Emulator-admin Node inspection of Firestore, Auth, and Storage.

No code fix was made, so the post-fix command suite was not rerun during this rerun. The previous automated suite remained green before this manual rerun, and this attempt changed only this QA report.

## Blockers

- Desktop Simulator input/focus control remained unreliable even on a fresh iPhone 16 simulator.
- The physical iPhone listed by Xcode was offline and could not be used for Route C.
- No native simulator tap/type helper such as Appium, idb, applesimutils, or WebDriverAgent was available in the environment.
- Because account creation/sign-in could not be controlled, the protected wardrobe setup flow and A-J manual checklist were not manually verified.

## Verification Decision

Wardrobe onboarding foundation is implemented and the installed development build can launch against isolated Firebase emulators, but the A-J wardrobe onboarding checklist is still not manually verified by this rerun.

The project is not ready to treat wardrobe onboarding as having passed installed-development-build manual QA. Storage trigger integration QA can proceed as a backend/emulator task, but real wardrobe image upload UI should remain blocked until wardrobe onboarding manual QA and full Storage trigger integration QA both pass.

Next recommended agent: Mobile Wardrobe Manual QA Rerun Agent on a physically controllable iPhone development build or a simulator environment with working tap/type automation, followed by the Upload UI Readiness Agent only after the onboarding manual gate passes.
