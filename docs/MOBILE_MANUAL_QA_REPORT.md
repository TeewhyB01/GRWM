# Mobile Manual QA Report

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
