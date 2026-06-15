# GRWM Architecture Review

Date: 2026-06-15

Architecture health rating: amber for production, ready for Wardrobe Image Upload UI MVP implementation.

GRWM now has the foundations needed to implement the real private wardrobe image upload UI. The upload UI itself is still intentionally unbuilt, but the preconditions for a narrow MVP are in place: signed-in and consent-gated mobile flow, manually verified wardrobe onboarding, private exact Storage paths, field-bound `wardrobeItems` drafts, backend finalisation helpers, Storage trigger handler QA, and documented non-destructive orphan detection.

## What Is Solid

- Monorepo boundaries are clear: `apps/mobile`, `apps/admin`, `functions`, `packages/shared`, `firebase`, and `docs`.
- Package management is consistently pnpm-based in workspace scripts.
- Mobile uses Expo development builds with `expo-dev-client`; Expo Go remains explicitly unsupported.
- Mobile Auth, profile persistence, protected navigation, privacy consent capture, Settings consent updates, and deletion request creation are implemented and manually QA'd against emulators.
- Wardrobe onboarding is implemented with intro, privacy explainer, category preferences, style basics, setup summary, and Wardrobe Home empty state.
- Installed-development-build wardrobe onboarding QA passed on 2026-06-15 using the local QA access harness without skipping privacy consent or setup.
- Wardrobe Home clearly states that real image upload is not active yet and shows a disabled "Add wardrobe item soon" CTA.
- `wardrobeSetupProfiles/{userId}` stores private setup preferences separately from image-backed wardrobe item records.
- `wardrobeItems` supports draft/upload lifecycle, owner binding, private storage path, upload status, analysis status, safe failure fields, and timestamps.
- Firestore rules enforce owner consistency, private client-writable wardrobe records, exact Storage path consistency, and client denial for backend-owned upload/analysis lifecycle fields.
- Storage rules enforce private user paths, allowed image MIME types, 10 MiB wardrobe max size, required owner/item/path/consent metadata, no broad list access, cross-user denial, and backend-owned generated output paths.
- Shared helpers create wardrobe upload drafts, build/validate required metadata, detect backend-owned wardrobe fields, validate upload policy, and separate upload consent from analysis consent.
- Functions helpers verify wardrobe Storage objects, mark valid uploads as `uploaded`, mark safe failure states where appropriate, write safe audit entries, and keep AI analysis unstarted.
- Storage trigger QA confirms Functions build output, v2 Storage trigger registration, private wardrobe path filtering, valid finalisation, safe failures, cross-user collision protection, idempotency, ignored non-wardrobe paths, and no AI job creation.
- Orphan detection reports missing records/files, stale `upload_pending` records, `upload_failed` records, and metadata mismatches without deleting anything.
- Account deletion covers wardrobe setup records, wardrobe item records, and private wardrobe Storage prefixes.

## Readiness Decision

GRWM is ready for the Wardrobe Image Upload UI Agent.

Allowed next work is limited to the private upload UI MVP in `docs/WARDROBE_UPLOAD_UI_PLAN.md`: add item screen, single image selection, client validation, Firestore draft first, exact Firebase Storage upload with required metadata, progress/error/retry/cancel states, backend finalisation to `uploaded`, and wardrobe list display.

The next agent must not build AI analysis, automatic outfit generation, avatar try-on, shopping recommendations, payment, affiliate links, public sharing, destructive orphan cleanup, or production deployment.

## What Is Risky

- Storage rules validate MIME type, size, and metadata claims, but cannot verify image bytes, run malware/moderation checks, or prove Firestore document existence before upload.
- Local Firebase Tools registered the v2 Storage trigger, but Storage emulator writes did not auto-deliver finalize events in this environment. QA invokes the registered handler with finalized payloads after emulator uploads; deployed event delivery should be rechecked before production enablement.
- Destructive orphan cleanup is intentionally disabled pending retention policy, audit design, and integration tests.
- Admin access is still a placeholder local session. Real admin access requires Firebase Auth, trusted role issuance, custom claims or mirrored role state, and owner bootstrap.
- Firestore rules still validate ownership more strongly than field shape for most non-wardrobe user-owned collections.
- User-owned `users/{uid}` writes are currently client writable for the foundation mobile signup flow. Production should move sensitive lifecycle fields behind trusted backend writes or stricter validation.

## Blockers

Blocking before upload UI:

- None found.

Can wait until after upload UI MVP:

- Recheck automatic v2 Storage finalize event delivery when Firebase Tools/runtime versions change.
- Extend deletion trigger integration to seed `wardrobeSetupProfiles` directly; the deletion plan already includes it and integration covers wardrobe item plus Storage deletion.
- Add UI-specific retry/rollback refinements after first manual upload QA if needed.

Production-readiness later:

- Verify deployed Storage finalize behavior in a non-production Firebase project.
- Define retention windows for failed uploads and orphaned Storage objects.
- Keep destructive cleanup disabled until separately tested and approved.
- Add image byte verification, moderation, and abuse scanning strategy before public launch.
- Replace admin placeholder auth and bootstrap real owner/admin roles.
- Add stronger rules validation for sensitive non-wardrobe collections.

## Security Concerns

- No cross-user Firestore or Storage issue was found in the reviewed upload boundary.
- No public Storage path was found.
- Generated avatar output paths remain backend-owned and not client-writable.
- Upload finalisation audit logs avoid private object names and image content.
- Private upload and AI analysis are separate: missing `wardrobePhotoAnalysis` consent blocks analysis, not private upload finalisation.
- No mobile image picker, mobile Firebase Storage upload, mobile AI provider call, or client-side wardrobe lifecycle tampering exists yet.

## Test Gaps

- Upload UI implementation tests do not exist yet because the UI is intentionally unbuilt.
- Manual upload QA must be run in an installed development build after adding image picker/native config.
- Automatic Storage finalize delivery needs non-production deployed verification before production enablement.
- Admin allow-path rules tests through `adminUsers` role documents.
- Firestore field-level validation tests for user profile, consent, style profile, avatar profile, and recommendation payloads.
- Additional production-like outage drills for deletion and upload finalisation.

## Verification

The required pnpm gate suite passed on 2026-06-15 using the project fallback pnpm binary with the bundled Node runtime on PATH:

- install, root typecheck, root lint, and root tests
- Firestore rules, Storage rules, and combined Firebase rules
- wardrobe upload trigger QA
- Functions typecheck and build
- mobile typecheck and tests
- admin typecheck

The first Firestore rules attempt failed before test execution because a stale orphaned Firestore emulator process was holding port `8085`. After clearing that stale process, the Firestore rules command passed with 42 tests. Firebase Tools repeated the known Java 21 future-requirement warning, `pnpm install` repeated the existing ignored `re2` build-script warning, and the Functions emulator reported the local Node 20 vs host Node 24 mismatch during emulator loading. None blocked the readiness decision.

## Recommended Next Agent

Recommended next agent: Wardrobe Image Upload UI Agent.

The agent should follow `docs/WARDROBE_UPLOAD_UI_PLAN.md`, add `expo-image-picker` if needed, rebuild the installed development build after native config changes, and keep AI/avatar/payment/shopping/affiliate/public-sharing/destructive-cleanup work out of scope.
