# Mobile Manual QA Report

## Actual Manual Emulator QA Run

- Date/time: 2026-06-14 22:19:57 BST.
- Result: manual A-G QA was actually run against the installed `com.grwm.mobile` development build.
- Target simulator: iPhone 17, iOS 26.5, UDID `869FD156-3EC8-4547-885A-17708718D606`.
- App launch: `xcrun simctl launch booted com.grwm.mobile` plus the Expo development-client URL for Metro.
- Expo Go: not used.
- Metro/dev-client: `http://localhost:8081/status` returned `packager-status:running`.
- Local env: `apps/mobile/.env.local` exists, is ignored by `.gitignore`, and points iOS simulator traffic at isolated emulator hosts on `127.0.0.1`.
- No real Firebase production credentials were used.

## Actual Emulator Ports Used

- Command: `pnpm qa:mobile:emulators:isolated`.
- Emulator UI: `http://127.0.0.1:4001/`.
- Emulator hub: `127.0.0.1:4410`.
- Authentication: `127.0.0.1:9100`.
- Cloud Firestore: `127.0.0.1:8085`.
- Cloud Functions: `127.0.0.1:5002`.
- Firebase Storage: `127.0.0.1:9195`.
- Logging: `127.0.0.1:4505`.
- Firestore websocket: `127.0.0.1:9150`.

Auth, Firestore, Storage, and Functions emulators started. Functions definitions loaded from compiled `functions/lib/index.js`.

## Actual Test Account

- Email pattern: `grwm-emulator-qa-20260614-2154@example.test`.
- Password: synthetic QA password only; not recorded in this report.
- Auth emulator UID observed: `Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`.

## Actual A-G Result

- A. Fresh signup: passed. New email/password account created, app routed to Privacy Consent, and Firestore created `users/{uid}` plus `userProfiles/{uid}`. `userProfiles/{uid}.locale` was `en`.
- B. Privacy consent: passed. Required consents were accepted, optional marketing and analytics remained off at initial consent, and `privacyConsents/{uid}` was created with `version: "2026-06-foundation"`, `source: "mobile"`, `createdAtIso`, and `updatedAtIso`.
- C. Auth persistence: passed. After terminating and relaunching the installed development build, the app returned to the protected Wardrobe screen and did not show Login.
- D. Logout/login: passed. Logout showed unauthenticated Login UI. Logging back in with the same synthetic account returned to protected Wardrobe/Today's Outfit/Settings screens.
- E. Settings privacy updates: passed. Marketing consent was toggled on from Settings, analytics remained off, and Firestore updated `privacyConsents/{uid}.marketingEmails` to `true` with a newer `updatedAtIso`.
- F. Deletion request: passed. Settings created `userDeletionRequests/{uid}` with `status: "requested"` and `requestedAtIso`. The client did not delete `users/{uid}`, `userProfiles/{uid}`, or `privacyConsents/{uid}`.
- G. Unauthenticated protection: passed. Final logout returned to unauthenticated Login UI, and only unauthenticated tabs were visible. Protected Wardrobe, Today's Outfit, Settings, Onboarding, and Privacy controls were not available while signed out.

## Actual Screens Tested

- Welcome.
- Login.
- Sign Up.
- Privacy Consent.
- Onboarding Start.
- Wardrobe.
- Today's Outfit.
- Settings.

## Actual Firestore Documents Observed

- `users/Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`: exists with the synthetic email, `authProvider: "password"`, `disabled: false`, and ISO created/updated/last-login timestamps.
- `userProfiles/Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`: exists with `displayName: ""`, `locale: "en"`, `countryCode: ""`, `subscriptionPlanId: "free"`, and `privacyConsentVersion: "2026-06-foundation"`.
- `privacyConsents/Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`: exists with all required purposes `true`, `marketingEmails: true` after Settings update, `analytics: false`, `source: "mobile"`, `version: "2026-06-foundation"`, `createdAtIso: "2026-06-14T21:01:25.749Z"`, and `updatedAtIso: "2026-06-14T21:14:42.752Z"`.
- `userDeletionRequests/Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`: exists with `status: "requested"`, `reason: "Requested from mobile settings."`, `requestedAtIso: "2026-06-14T21:15:54.632Z"`, and empty `completedAtIso`.
- `styleProfiles/Gt3Mmto7DIYKd8bxlyIjcjSKpZjW`: not created, as expected for this QA slice.

## Actual Screenshot Notes

Screenshots were captured locally under `/tmp/grwm-qa/`, including:

- `/tmp/grwm-qa/final-signup-filled.png`.
- `/tmp/grwm-qa/final-after-signup.png`.
- `/tmp/grwm-qa/final-privacy-start.png`.
- `/tmp/grwm-qa/final-after-save-consent.png`.
- `/tmp/grwm-qa/final-persistence-reopen.png`.
- `/tmp/grwm-qa/final-after-login-dismissed.png`.
- `/tmp/grwm-qa/final-settings-marketing-on-confirmed.png`.
- `/tmp/grwm-qa/final-settings-after-save-offset.png`.
- `/tmp/grwm-qa/final-settings-deletion-created.png`.
- `/tmp/grwm-qa/final-after-logout-confirmed.png`.

Manual note: Simulator click coordinates for lower Settings controls required calibration. This affected desktop automation only; the visible app state and Firestore writes were verified after each step.

## Actual Fixes Made During QA

- Fixed mobile Firebase Auth persistence by returning a constructible AsyncStorage persistence class instead of a plain object. This resolved Firebase Auth's development-build assertion: `Expected a class definition`.
- Fixed Firestore rules for owner-keyed missing-document reads on `userProfiles`, `privacyConsents`, and `userDeletionRequests`. This allowed the signed-in app to read its own missing consent/deletion documents as not-found instead of failing with a rules null-resource error.
- Added Firestore rules tests for reading a missing own `privacyConsents/{uid}` document and denying the same read for another user's ID.

## Actual Commands Run

- `pnpm qa:mobile:emulators:isolated`: passed; Auth, Firestore, Storage, Functions, UI, hub, logging, and websocket listeners started on isolated ports.
- `pnpm mobile:start:dev-client`: Metro was already available and confirmed through `http://localhost:8081/status`.
- `pnpm qa:mobile:install-check`: passed before this run; `com.grwm.mobile` was installed on the booted iPhone 17 simulator.
- `xcrun simctl launch booted com.grwm.mobile`: passed.
- `xcrun simctl openurl booted 'exp+grwm://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081'`: passed.
- Firebase Admin SDK reads against `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9100`: passed.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `pnpm test:firebase-rules`: passed, 26/26 rules tests.
- `pnpm --filter mobile typecheck`: passed.
- `pnpm --filter mobile test`: passed, 15/15 mobile tests.

## Actual Release Blockers

- None for the current auth/profile/privacy/deletion emulator QA slice.
- Account/data deletion is still only requested by the client; production deletion still requires a trusted backend processor before real data collection.

Post-backend update: the trusted `userDataDeletion` processor has since been added. This historical QA report still only verifies mobile deletion request creation; full Functions trigger integration remains separate.

## Actual Recommended Fixes

- Keep the Firebase Auth persistence adapter covered because the development build exercises a stricter runtime path than the prior unit-only placeholder.
- Keep the missing-own-document Firestore rules tests; they protect the first-run privacy consent and deletion-request reads.
- Add future Functions emulator tests for trusted consent/deletion processors when those backend workflows are implemented.

## Actual Signup/Login/Profile/Consent/Deletion Emulator Status

- Signup works on the installed development build against Auth and Firestore emulators.
- Login/logout works.
- Auth persistence works after app relaunch.
- Profile creation works and defaults locale to English.
- Initial privacy consent capture works with `source: "mobile"` and timestamps.
- Settings consent updates work.
- Deletion request creation works and does not directly delete user data from the client.

## Actual Next Recommended Agent

Backend Deletion Processor Agent, after product approval for trusted account/data deletion processing.

## Development Build Installed Update

- Date/time: 2026-06-14 21:07:55 BST.
- Installer result: EAS iOS simulator development build succeeded and `com.grwm.mobile` is installed on the booted iOS simulator.
- Current booted simulator: iPhone 17, iOS 26.5, UDID `869FD156-3EC8-4547-885A-17708718D606`.
- EAS project: `@olutayo001/grwm`, project ID `07f8ab87-4d20-4a95-9fea-caaf899bc741`.
- EAS build ID: `4fdd7f86-f4f9-4a85-aea8-1b55b809132a`.
- EAS build URL: `https://expo.dev/accounts/olutayo001/projects/grwm/builds/4fdd7f86-f4f9-4a85-aea8-1b55b809132a`.
- Build profile: `development-simulator`.
- Build artifact: iOS simulator development build for `com.grwm.mobile`.
- Artifact URL: `https://expo.dev/artifacts/eas/J3QTefwCVF-AHGWd3GYfJN6dWDHQTrzG6t4xwhpShRo.tar.gz`.
- EAS CLI install helper stalled near the end of artifact download, so the artifact was downloaded directly with `curl`, extracted with `tar`, and installed with `xcrun simctl install`.
- Installed app path: `/Users/olutayooladeinbo/Library/Developer/CoreSimulator/Devices/869FD156-3EC8-4547-885A-17708718D606/data/Containers/Bundle/Application/83D8230E-AB7C-43F3-9F19-CB2AABB82A62/GRWM.app`.
- `pnpm qa:mobile:install-check`: passed.
- `xcrun simctl launch booted com.grwm.mobile`: passed and returned process ID `21241`.
- Expo Go remains unsupported and was not used.
- EAS added `extra.eas.projectId` and `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` to `apps/mobile/app.json`.

## Historical Rerun Decision After Build Install

Mobile Manual Emulator QA can now be rerun on iOS simulator because `com.grwm.mobile` is installed. Start Firebase emulators and Metro for the dev client, then rerun the A-G checklist in `docs/MOBILE_EMULATOR_QA.md`.

```bash
pnpm qa:mobile:emulators:isolated
pnpm mobile:start:dev-client
pnpm qa:mobile:install-check
```

Next recommended agent: Mobile Manual Emulator QA Runner.

## Build Installer Update

- Date/time: 2026-06-14 20:39:32 BST.
- Installer result: development-build install path prepared, but `com.grwm.mobile` is still not installed on the booted iOS simulator.
- Current booted simulator: iPhone 17, iOS 26.5, UDID `869FD156-3EC8-4547-885A-17708718D606`.
- Installed app check: `pnpm qa:mobile:install-check` failed with `No such file or directory`.
- App identity confirmed: iOS bundle identifier and Android package are both `com.grwm.mobile`.
- Development build dependency confirmed: `expo-dev-client` is installed and configured in `apps/mobile/app.json`.
- EAS development-simulator profile confirmed: `developmentClient: true` and `ios.simulator: true`.
- EAS internal development profile confirmed: `developmentClient: true`, `distribution: internal`, and Android `buildType: apk`.
- Expo Go remains unsupported and was not used.
- EAS cloud route blocker: `EXPO_TOKEN` is missing and `pnpm --filter mobile exec eas whoami` reports `Not logged in`.
- Local iOS route blocker: CocoaPods is not installed. Expo tried Gem install, Gem install failed, Homebrew is not available, and Xcode failed with `The sandbox is not in sync with the Podfile.lock. Run 'pod install' or update your CocoaPods installation.`
- Android route blocker in this shell: `adb` is not on PATH.

## Build Installer Fixes

- Added root development-build scripts:
  - `pnpm mobile:dev-client:ios-simulator`
  - `pnpm mobile:dev-client:android`
  - `pnpm mobile:eas:build:ios-simulator`
  - `pnpm mobile:eas:run:ios`
  - `pnpm mobile:start:dev-client`
  - `pnpm functions:build`
  - `pnpm qa:mobile:install-check`
- Added mobile package scripts for local iOS/Android dev-client builds and EAS simulator install.
- Added Android EAS development APK output for emulator/internal installs.
- Added `functions/tsconfig.build.json` and a Functions build script that emits `functions/lib/index.js`.
- Updated emulator scripts to run `pnpm functions:build` before starting Functions emulator definitions.
- Added `docs/MOBILE_DEVELOPMENT_BUILD_INSTALL.md`.

## Functions Emulator Status

- `pnpm --filter functions build` now generates `functions/lib/index.js`.
- Firebase Functions emulator successfully loaded definitions from the compiled output.
- Loaded definitions: `affiliateClickTracking`, `avatarGenerationRequest`, `createUserProfileOnSignup`, `dailyOutfitRecommendation`, `logAdminAction`, `occasionOutfitRecommendation`, `recordPrivacyConsent`, `requestUserDataDeletion`, `subscriptionWebhook`, `userDataDeletion`, `validateAdminRole`, and `wardrobeAnalysis`.
- Remaining note: Firebase CLI warned that requested Node `20` does not match host Node `24`; the emulator used host Node `24` in this shell.

## Build Installer Commands Run

- `pnpm install`: passed; lockfile already up to date. pnpm warned that dependency build scripts for `re2` are unapproved.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `pnpm test:firebase-rules`: passed, 24/24 rules tests.
- `pnpm --filter mobile typecheck`: passed.
- `pnpm --filter mobile test`: passed, 15/15 tests.
- `pnpm --filter functions typecheck`: passed.
- `pnpm --filter functions build`: passed.
- `pnpm qa:mobile:eas:config`: passed, 15/15 tests.
- `pnpm qa:mobile:install-check`: failed because `com.grwm.mobile` is not installed.
- `pnpm exec firebase emulators:exec --project demo-grwm --only functions "node -e \"console.log('functions emulator loaded')\""`: passed and loaded Functions definitions.
- `pnpm mobile:dev-client:ios-simulator`: failed because CocoaPods is unavailable and Pod install could not complete.

## Exact Next Install Commands

After installing CocoaPods locally, rerun:

```bash
pnpm mobile:dev-client:ios-simulator
pnpm qa:mobile:install-check
pnpm mobile:start:dev-client
```

Or, after logging in to Expo or setting `EXPO_TOKEN`, use the EAS simulator route:

```bash
pnpm mobile:eas:build:ios-simulator
pnpm mobile:eas:run:ios
pnpm qa:mobile:install-check
pnpm mobile:start:dev-client
```

Then rerun the A-G checklist in `docs/MOBILE_EMULATOR_QA.md`.

## Historical Rerun Decision Before Build Install

Mobile Manual Emulator QA cannot be rerun yet because `com.grwm.mobile` is still not installed. The Functions `lib/index.js` issue is fixed, and the remaining blocker is native build/install tooling or Expo authentication.

Next recommended agent: Mobile Native Tooling Installer for CocoaPods or Expo authentication setup, then Mobile Manual Emulator QA Runner.

## Run Summary

- Date/time: 2026-06-14 20:08:18 BST.
- Target platform: iOS simulator, iPhone 17, iOS 26.5.
- Result: prepared only; manual A-G app flow was not run.
- Exact blocker: no installed GRWM development build with bundle identifier `com.grwm.mobile` on the booted simulator.
- Expo Go: installed on the simulator but not used.
- Android emulator: not used; `adb` was not available in this shell.
- pnpm: `/Users/olutayooladeinbo/Documents/IAttend 2/.tools/bin/pnpm` with bundled Node on PATH, because `pnpm` and `node` were not on the default PATH.

## Environment

- Existing ignored local env confirmed: `apps/mobile/.env.local`.
- `apps/mobile/.env.local` uses safe demo Firebase values for project `demo-grwm`.
- No real Firebase production credentials were used.
- `.env.local` is ignored by `.gitignore` through `.env.*` and was not committed.
- Current target host values are correct for iOS simulator isolated emulator QA: `127.0.0.1`.
- Current target ports in `.env.local`: Auth `9100`, Firestore `8085`.
- Standard Firebase ports were not observed as occupied at the start of this run, but the existing local env was already configured for the documented isolated mobile QA suite, so the matching isolated emulator script was used.

## Emulator Ports Used

- Command: `pnpm qa:mobile:emulators:isolated`.
- Emulator UI: `http://127.0.0.1:4001/`.
- Emulator hub: `127.0.0.1:4410`.
- Authentication: `127.0.0.1:9100`.
- Cloud Firestore: `127.0.0.1:8085`.
- Cloud Functions: `127.0.0.1:5002`.
- Firebase Storage: `127.0.0.1:9195`.
- Firestore websocket: `127.0.0.1:9150`.

Auth, Firestore, Storage, and Functions listeners were observed through the emulator startup output and hub endpoint. The Functions emulator listener started, but function definitions did not load because `functions/lib/index.js` has not been built.

## Mobile Server

- Command: `pnpm qa:mobile:start`.
- Metro loaded `apps/mobile/.env.local`.
- Metro URL: `exp+grwm://expo-development-client/?url=http%3A%2F%2F192.168.4.24%3A8081`.
- Web status page: `http://localhost:8081`, HTTP 200.
- iOS simulator booted: iPhone 17, iOS 26.5.
- Development build check: `xcrun simctl get_app_container booted com.grwm.mobile app` failed with `No such file or directory`, confirming the app is not installed.

## Test Account

- Pattern reserved for manual run: `grwm-emulator-qa-YYYYMMDD-HHMM@example.test`.
- Password: not recorded and not included in this report.
- No account was created because the app was not opened in a GRWM development build.

## Manual Flow Result

- A. Fresh signup: not run; blocked by missing installed dev build.
- B. Privacy consent: not run; blocked by missing installed dev build.
- C. Auth persistence: not run; blocked by missing installed dev build.
- D. Logout/login: not run; blocked by missing installed dev build.
- E. Settings privacy updates: not run; blocked by missing installed dev build.
- F. Deletion request: not run; blocked by missing installed dev build.
- G. Unauthenticated protection: not run; blocked by missing installed dev build.

## Screens Tested

No GRWM app screens were manually opened. Emulator startup, Metro readiness, simulator boot, and installed-app readiness were tested only.

Expected screens for the next run:

- Welcome.
- Language Selection.
- Country Selection.
- Sign Up.
- Privacy Consent.
- Onboarding Start.
- Wardrobe Home.
- Today's Outfit.
- Settings.
- Login.

## Firestore Documents Observed

No Firestore documents were created or observed from the mobile app during this run.

Expected documents for the next run:

- `users/{uid}`.
- `userProfiles/{uid}` with default `locale: "en"`.
- `privacyConsents/{uid}` with `source: "mobile"`, consent version, and timestamps.
- `userDeletionRequests/{uid}` with `status: "requested"`.

## Passed

- `apps/mobile/.env.local` exists and uses safe emulator values.
- `.env.local` is ignored and not tracked.
- iOS simulator host values are correct for the selected isolated emulator target.
- Isolated GRWM emulators started on documented ports.
- Auth, Firestore, Storage, and Functions emulator listeners were available.
- Emulator UI was available at `http://127.0.0.1:4001/`.
- Metro started with `expo start --dev-client`.
- Metro loaded the local emulator env.
- The iPhone 17 simulator booted successfully.
- Expo Go was not used.
- `pnpm qa:mobile:eas:config` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm test:firebase-rules` passed.
- `pnpm --filter mobile typecheck` passed.
- `pnpm --filter mobile test` passed.

## Failed Or Blocked

- Manual app QA A-G did not run because the iOS simulator does not have the GRWM development build installed.
- Functions definitions did not load in the emulator because compiled output is missing at `functions/lib/index.js`.
- Android emulator QA was not attempted because `adb` was unavailable.

## Release Blockers

- Install a GRWM development build on the target simulator/device and rerun A-G.
- Build or configure Functions output before relying on Functions endpoint QA.

## Exact Next Build Commands

For a local iOS simulator build:

```bash
PATH="/Users/olutayooladeinbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm --filter mobile ios
```

For an EAS iOS simulator development build:

```bash
PATH="/Users/olutayooladeinbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm qa:mobile:eas:development:ios-simulator
```

After installing the development build, run:

```bash
PATH="/Users/olutayooladeinbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm qa:mobile:emulators:isolated
PATH="/Users/olutayooladeinbo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm qa:mobile:start
```

## Commands Run

- `command -v pnpm` failed; `pnpm` was not on the default PATH.
- `/Users/olutayooladeinbo/Documents/IAttend 2/.tools/bin/pnpm --version` passed with bundled Node on PATH and returned `10.12.1`.
- `xcrun simctl list devices available` found iOS 26.5 simulators.
- `xcrun simctl boot 869FD156-3EC8-4547-885A-17708718D606` booted iPhone 17.
- `xcrun simctl list devices booted` confirmed iPhone 17 was booted.
- `xcrun simctl listapps booted` did not show `com.grwm.mobile`.
- `xcrun simctl get_app_container booted com.grwm.mobile app` failed, confirming no installed development build.
- `pnpm qa:mobile:emulators:isolated` started GRWM emulators.
- `curl http://127.0.0.1:4410/emulators` confirmed emulator listeners.
- `pnpm qa:mobile:start` started Metro with dev-client mode.
- `curl -I http://localhost:8081` returned HTTP 200.
- `pnpm qa:mobile:eas:config` passed with 15/15 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm test:firebase-rules` passed with 24/24 rules tests.
- `pnpm --filter mobile typecheck` passed.
- `pnpm --filter mobile test` passed with 15/15 tests.

## Recommended Fixes

- Install the iOS simulator development build and rerun the complete A-G manual flow.
- Add a Functions build step or emulator-specific Functions TypeScript loading path before Functions endpoint QA.
- Keep `.env.local` aligned with the emulator script in use: standard ports for `pnpm qa:mobile:emulators`, isolated ports for `pnpm qa:mobile:emulators:isolated`.

## Signup/Login/Profile/Consent/Deletion Emulator Status

- Signup/login/profile/consent/deletion are not manually verified on emulator in this run.
- The emulator and Metro environment is ready for those flows once the GRWM development build is installed.
- No small wiring blockers were fixed because the app could not be launched.

## Next Recommended Agent

Mobile Development Build Installer, then Mobile Manual Emulator QA Runner with the installed `com.grwm.mobile` development build.
