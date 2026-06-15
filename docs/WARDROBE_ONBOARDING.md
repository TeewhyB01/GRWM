# Wardrobe Onboarding Foundation

Date: 2026-06-15

The wardrobe onboarding foundation lets signed-in users describe the wardrobe they expect to add later without uploading photos. It prepares GRWM for a later wardrobe upload phase while keeping photo handling privacy-first.

## Purpose

Wardrobe setup explains:

- GRWM helps style clothes the user already owns.
- Wardrobe data is private and account-scoped.
- Future wardrobe photo analysis requires explicit consent.
- Photo upload is not active in this phase.
- AI analysis will only happen after consent and a later trusted workflow.

## Mobile Screens

- `WardrobeSetupIntroScreen`: introduces owned-wardrobe styling, private setup storage, and consent-gated future analysis.
- `WardrobePrivacyExplainerScreen`: explains private wardrobe storage, no public sharing, Settings privacy controls, and consent before analysis.
- `WardrobeCategoryPreferencesScreen`: captures clothing categories the user expects to add later.
- `WardrobeStyleBasicsScreen`: captures dress code, formality, colour families, modesty preference, and workwear/occasionwear relevance.
- `WardrobeSetupSummaryScreen`: reviews saved choices and completes setup.
- `WardrobeHomeScreen`: shows an empty state and disabled "Add wardrobe item soon" CTA.

## Data Stored

Firestore path:

- `wardrobeSetupProfiles/{userId}`

Stored fields:

- `id`
- `userId`
- `selectedCategories`
- `styleBasics`
- `setupStatus`: `not_started`, `in_progress`, or `completed`
- `source`: `mobile`
- `createdAt`
- `updatedAt`
- `completedAt`

No wardrobe image paths, Storage metadata, generated recommendations, avatar data, shopping data, payment data, or AI job data are stored by wardrobe onboarding.

## Reset Behaviour

The mobile setup service includes `resetWardrobeSetup(userId)`. It is a safe reset: it overwrites the user's own setup profile with empty categories, default style basics, `setupStatus: not_started`, and a fresh `updatedAt`. It preserves the original `createdAt` when one exists and does not delete documents, call Storage, create wardrobe image records, or request analysis.

## Privacy Rules

Firestore rules enforce that authenticated users can read and write only `wardrobeSetupProfiles/{request.auth.uid}`. The document `id` and `userId` must match the authenticated UID, required fields must exist, `source` must be `mobile`, and all category/style/status values must come from allowed enums.

Account deletion includes `wardrobeSetupProfiles/{userId}` in the trusted backend Firestore deletion plan.

## Manual QA Status

2026-06-15 installed-development-build wardrobe onboarding QA was attempted against isolated Firebase emulators on the iPhone 17 simulator. The installed `com.grwm.mobile` build, emulator startup, Metro startup, development-client launch, and fresh unauthenticated Welcome state after app-data reset were confirmed.

The full A-J wardrobe onboarding flow was not completed because desktop Simulator input/focus automation blocked test account creation before protected wardrobe screens could be reached. No app fixes were made. Evidence is in `docs/MOBILE_WARDROBE_ONBOARDING_QA_REPORT.md`.

Status: implemented and automated checks are green, but the wardrobe onboarding foundation is not yet manually verified.

## Still Blocked

The foundation intentionally does not implement:

- Image picker UI.
- Firebase Storage upload from the mobile app.
- `wardrobeItems` image record creation from the setup flow.
- AI analysis jobs or provider calls.
- Avatar, payment, shopping, or affiliate flows.

Real wardrobe image upload UI remains blocked until full Storage trigger emulator coverage, installed development-build mobile QA, and retention/cleanup approval are complete.

## Next Step Before Upload UI

Recommended next step: Mobile Wardrobe Manual QA Rerun Agent, then Upload UI Readiness Agent.

The manual QA rerun should complete the A-J installed-development-build checklist with a fresh synthetic emulator account. Storage trigger handler QA is now covered separately in `docs/STORAGE_TRIGGER_QA.md`; after onboarding manual QA passes, upload readiness work should confirm non-destructive cleanup/retention decisions, recheck automatic Storage event delivery before production enablement, and rerun installed-development-build mobile manual QA before any real image picker or Storage upload UI is enabled.
