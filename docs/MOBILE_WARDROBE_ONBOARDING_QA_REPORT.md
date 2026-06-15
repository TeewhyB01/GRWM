# Mobile Wardrobe Onboarding QA Report

Date/time: 2026-06-15 19:45 BST

## Scope

Manual QA was rerun for the wardrobe onboarding foundation on the installed `com.grwm.mobile` iOS development build against local Firebase emulators. The dev-only local QA access harness was used only to bypass unreliable simulator account text entry; the wardrobe onboarding flow itself was not skipped.

No Expo Go, image picker, Firebase Storage upload UI, AI, avatar, payment, shopping, affiliate, or upload work was built.

## Target

- Simulator: `GRWM Wardrobe QA iPhone 16`
- iOS: 26.5
- Simulator UDID: `9D80B63A-D2F4-4C73-8962-754514A862AE`
- App: installed `com.grwm.mobile` development build
- Metro: `http://127.0.0.1:8081`
- Expo Go: not used; the booted simulator app list showed `com.grwm.mobile` and no Expo Go bundle.

## Local QA Access Setup

- `apps/mobile/.env.local` exists locally.
- `.env.local` is ignored by `.gitignore` via `.env.*`.
- `git ls-files apps/mobile/.env.local .env.local '**/.env.local'` returned no tracked files.
- `GRWM_ENABLE_QA_ACCESS=true` is set locally.
- `EXPO_PUBLIC_GRWM_ENABLE_QA_ACCESS=true` is set locally.
- Firebase emulator mode is enabled with `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true`.
- Firebase config is local/demo safe:
  - project ID: `demo-grwm`
  - auth domain: `demo-grwm.firebaseapp.com`
  - storage bucket: `demo-grwm.appspot.com`
  - demo placeholder API/app config only
- Production mode is not active.
- QA access remains guarded in code by explicit flags, development/local/test runtime, emulator mode, React Native non-production runtime, and safe local Firebase config.

## Emulator Ports

- Emulator UI: `127.0.0.1:4001`
- Auth: `127.0.0.1:9100`
- Firestore: `127.0.0.1:8085`
- Functions: `127.0.0.1:5002`
- Storage: `127.0.0.1:9195`
- Emulator hub: `127.0.0.1:4410`
- Logging: `127.0.0.1:4505`
- Metro/dev-client: `127.0.0.1:8081`

The Emulator UI responded at `http://127.0.0.1:4001`, and Metro returned `packager-status:running`.

## Environment Preparation

- `pnpm` was not on PATH, so `/Users/olutayooladeinbo/Documents/IAttend 2/.tools/bin/pnpm` was used with the bundled Codex Node runtime on PATH.
- The isolated mobile QA Firebase emulator command was already running for Auth, Firestore, Storage, Functions, UI, hub, and logging.
- Metro/dev-client was already running from the existing mobile dev-client command.
- Auth and Firestore emulator state were cleared before the rerun.
- The installed `com.grwm.mobile` development build was relaunched and loaded the Metro bundle through the development-client URL.
- Simulator input was corrected by mapping CoreGraphics events to the actual Simulator window bounds.

## QA Access Harness Result

The login screen showed:

- `Local emulator QA only. Hidden in production.`
- `Continue with local QA account`

Tapping `Continue with local QA account` signed in the local QA user and created only:

- Auth emulator user: `wardrobe-qa+20260615180217+ul6dyf4d3m@example.test`
- `users/YlZ8aYawPV2bwxo5TC4QHlHP63sC`
- `userProfiles/YlZ8aYawPV2bwxo5TC4QHlHP63sC`

Immediately after the QA access button:

- `privacyConsents`: 0
- `wardrobeSetupProfiles`: 0
- `wardrobeItems`: 0
- `styleProfiles`: 0
- `outfitRecommendations`: 0
- `avatarProfiles`: 0
- Storage files: 0

The harness did not create wardrobe setup, wardrobe items, Storage files, or AI side-effect records.

## A-J Checklist

| Step | Result | Notes |
| --- | --- | --- |
| A. Fresh auth state | Pass | App opened to login, QA access signed in, protected app screens loaded. |
| B. Wardrobe setup entry | Pass | `WardrobeSetupIntroScreen` appeared. Copy says GRWM styles clothes the user already owns, mentions privacy, and does not expose image upload or image picker. |
| C. Privacy explainer | Pass | Explainer says wardrobe is private, AI wardrobe analysis requires consent, and privacy choices can be changed in Settings. No AI call or analysis job was created. |
| D. Category preferences | Pass | Selected tops, trousers, dresses, shoes, bags, workwear, occasion wear, and traditional/cultural clothing. Toggle on/off behavior worked. Empty selection was safely accepted before final category selection. |
| E. Style basics | Pass | Saved casual dress code, relaxed formality, black/navy/green favourites, purple/orange avoids, no modesty preference, workwear often, and occasionwear sometimes. Values displayed correctly. |
| F. Summary and save | Pass | Summary showed the selected categories and style basics. Completing setup created/updated `wardrobeSetupProfiles/{uid}` with `setupStatus: completed`, `source: mobile`, timestamps, and matching `userId`. |
| G. Wardrobe home empty state | Pass | Wardrobe home showed the empty state, stated real image upload is not active yet, and showed `Add wardrobe item soon` as disabled/coming soon. No Storage upload was attempted. |
| H. Persistence check | Pass | After closing and reopening the app, the user remained authenticated and Wardrobe Home still showed completed setup. |
| I. Settings/privacy alignment | Pass | Settings privacy controls loaded. `wardrobePhotoAnalysis` was toggled on and saved. No AI analysis, recommendation record, wardrobe item, or Storage file was created. |
| J. Signed-out protection | Pass | Log out returned to the login screen. Tapping Wardrobe while signed out kept the app on unauthenticated login UI. |

## Firestore Documents Observed

Auth user:

- UID: `YlZ8aYawPV2bwxo5TC4QHlHP63sC`
- Email: `wardrobe-qa+20260615180217+ul6dyf4d3m@example.test`
- Email verified: false

`users/YlZ8aYawPV2bwxo5TC4QHlHP63sC`:

- `email`: `wardrobe-qa+20260615180217+ul6dyf4d3m@example.test`
- `authProvider`: `password`
- `disabled`: false
- `createdAtIso`, `updatedAtIso`, `lastLoginAtIso`: `2026-06-15T18:02:17.112Z`

`userProfiles/YlZ8aYawPV2bwxo5TC4QHlHP63sC`:

- `userId`: `YlZ8aYawPV2bwxo5TC4QHlHP63sC`
- `locale`: `en`
- `countryCode`: empty string
- `subscriptionPlanId`: `free`
- `privacyConsentVersion`: `2026-06-foundation`

`privacyConsents/YlZ8aYawPV2bwxo5TC4QHlHP63sC`:

- `source`: `mobile`
- `version`: `2026-06-foundation`
- `wardrobePhotoAnalysis`: true after Settings update
- `stylePhotoAnalysis`: false
- `avatarCreation`: false
- `locationWeatherUse`: false
- `aiRecommendationUse`: false
- `marketingEmails`: false
- `analytics`: false
- `createdAtIso`: `2026-06-15T18:03:33.126Z`
- `updatedAtIso`: `2026-06-15T18:43:15.092Z`

`wardrobeSetupProfiles/YlZ8aYawPV2bwxo5TC4QHlHP63sC`:

- `id`: `YlZ8aYawPV2bwxo5TC4QHlHP63sC`
- `userId`: `YlZ8aYawPV2bwxo5TC4QHlHP63sC`
- `source`: `mobile`
- `setupStatus`: `completed`
- `createdAt`: `2026-06-15T18:04:25.018Z`
- `updatedAt`: `2026-06-15T18:27:59.953Z`
- `completedAt`: `2026-06-15T18:27:59.953Z`
- `selectedCategories`: `tops`, `trousers`, `dresses`, `shoes`, `bags`, `workwear`, `occasion_wear`, `traditional_cultural_clothing`
- `styleBasics.typicalDressCode`: `casual`
- `styleBasics.preferredOutfitFormality`: `relaxed`
- `styleBasics.favouriteColourFamilies`: `black`, `navy`, `green`
- `styleBasics.coloursToAvoid`: `purple`, `orange`
- `styleBasics.modestyPreference`: `no_preference`
- `styleBasics.workwearRelevance`: `often`
- `styleBasics.occasionwearRelevance`: `sometimes`

Final emulator collection counts:

- `users`: 1
- `userProfiles`: 1
- `privacyConsents`: 1
- `wardrobeSetupProfiles`: 1
- `wardrobeItems`: 0
- `styleProfiles`: 0
- `outfitRecommendations`: 0
- `avatarProfiles`: 0
- `subscriptions`: 0
- `userDeletionRequests`: 0

## Storage And AI Confirmation

- Firebase Storage emulator files observed: 0.
- No Storage upload was attempted from the mobile app.
- No image-backed `wardrobeItems` records were created.
- No `outfitRecommendations` records were created.
- No `avatarProfiles` records were created.
- The shared collection constants include future `aiJobs`, but no mobile AI provider call or AI job creation path ran during this QA.
- Toggling wardrobe analysis consent in Settings did not trigger AI analysis.

## Evidence Screenshots

- `/tmp/grwm-wardrobe-qa-welcome.png`
- `/tmp/grwm-wardrobe-qa-after-qa-click.png`
- `/tmp/grwm-wardrobe-qa-after-consent.png`
- `/tmp/grwm-wardrobe-qa-intro.png`
- `/tmp/grwm-wardrobe-qa-privacy-explainer.png`
- `/tmp/grwm-wardrobe-qa-categories-all-final.png`
- `/tmp/grwm-wardrobe-qa-style-selected-top.png`
- `/tmp/grwm-wardrobe-qa-style-bottom-final.png`
- `/tmp/grwm-wardrobe-qa-summary-final.png`
- `/tmp/grwm-wardrobe-qa-wardrobe-home.png`
- `/tmp/grwm-wardrobe-qa-after-reopen.png`
- `/tmp/grwm-wardrobe-qa-settings.png`
- `/tmp/grwm-wardrobe-qa-settings-saved-consent.png`
- `/tmp/grwm-wardrobe-qa-after-logout.png`
- `/tmp/grwm-wardrobe-qa-signed-out-wardrobe-protection.png`

## Fixes Made

None. No app-side code blocker was found. The only interaction issue was simulator coordinate mapping on the host desktop; it was handled in the manual QA procedure.

Because no code fix was made, the post-fix command suite was not rerun:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm test:firestore-rules`
- `pnpm test:storage-rules`
- `pnpm test:firebase-rules`
- `pnpm --filter mobile typecheck`
- `pnpm --filter mobile test`
- `pnpm --filter functions typecheck`
- `pnpm --filter functions build`
- `pnpm --filter admin typecheck`

## Safety Scan

- `.env.local` is ignored and untracked.
- No hardcoded OpenAI/Anthropic private key or service-account private key was found in `apps`, `firebase`, or `packages`.
- QA access is guarded against production runtime, disabled emulator mode, and non-demo Firebase config.
- No image picker usage was found in `apps/mobile`.
- No mobile Firebase Storage upload API usage was found in `apps/mobile/src`.
- No mobile AI provider call was found in `apps/mobile/src`.
- QA helper default behavior is covered by tests asserting no `wardrobeSetupProfiles`, `wardrobeItems`, `storage:upload`, or `firestore:aiJobs` actions are created by default.

## Commands Run

- `git status --short`
- `git check-ignore -v apps/mobile/.env.local`
- `git ls-files apps/mobile/.env.local .env.local '**/.env.local'`
- `lsof -nP -iTCP:4001 -iTCP:8085 -iTCP:9100 -iTCP:9195 -iTCP:5002 -iTCP:8081 -sTCP:LISTEN`
- `curl http://127.0.0.1:4001`
- `curl http://127.0.0.1:8081/status`
- `curl -X DELETE http://127.0.0.1:9100/emulator/v1/projects/demo-grwm/accounts`
- `curl -X DELETE http://127.0.0.1:8085/emulator/v1/projects/demo-grwm/databases/(default)/documents`
- `xcrun simctl list devices booted`
- `xcrun simctl listapps booted`
- `xcrun simctl get_app_container booted com.grwm.mobile app`
- `xcrun simctl terminate booted com.grwm.mobile`
- `xcrun simctl uninstall booted com.grwm.mobile`
- `xcrun simctl install booted /tmp/GRWM-QA-dev-build.app`
- `xcrun simctl launch booted com.grwm.mobile`
- `xcrun simctl openurl booted exp+grwm://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`
- `xcrun simctl io booted screenshot ...`
- Swift/CoreGraphics mapped click and drag scripts for simulator manual input.
- Emulator-backed Admin SDK inspection of Auth, Firestore, and Storage.
- `rg -n "ImagePicker|expo-image-picker|launchImageLibrary|launchCamera|react-native-image-picker|DocumentPicker" apps/mobile`
- `rg -n "firebase/storage|getStorage|uploadBytes|uploadString|uploadBytesResumable|putFile|getDownloadURL|ref\\(" apps/mobile/src apps/mobile/App.tsx`
- `rg -n "openai|anthropic|gemini|aiJobs|analysis job|outfitRecommendations|avatarProfiles|fetch\\(" apps/mobile/src functions/src packages/shared/src`
- `rg -n "wardrobeSetupProfiles|wardrobeItems|storage|aiJobs|recordPrivacyConsent|outfitRecommendations|avatarProfiles" apps/mobile/src/qa apps/mobile/src/index.test.ts`

## Blockers

None remaining for wardrobe onboarding manual QA. Simulator input required mapped desktop coordinates, but the app flow itself completed.

## Verification Decision

Wardrobe onboarding foundation is manually verified on the installed `com.grwm.mobile` development build using Firebase emulators and the dev-only local QA access harness.

The project is ready for the Upload UI Readiness Agent.

The project is not yet ready for real wardrobe image upload UI implementation; that should remain gated until the Upload UI Readiness Agent confirms the upload surface, privacy copy, retention/cleanup expectations, and Storage-trigger integration readiness.

Next recommended agent: Upload UI Readiness Agent.
