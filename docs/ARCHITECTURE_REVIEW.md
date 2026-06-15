# GRWM Architecture Review

Date: 2026-06-15

Architecture health rating: amber.

GRWM is clean enough to begin wardrobe onboarding foundation work, provided that onboarding continues to collect explicit user-provided preferences and does not upload images yet. The wardrobe upload lifecycle foundation is now defined and helper-tested, but GRWM is still not ready for real wardrobe image upload UI until the release blockers below are addressed.

## What Is Solid

- Monorepo boundaries are clear: `apps/mobile`, `apps/admin`, `functions`, `packages/shared`, `firebase`, and `docs`.
- Package management is consistently pnpm-based in workspace scripts.
- Mobile uses Expo development builds with `expo-dev-client`; Expo Go remains explicitly unsupported.
- Mobile Auth, profile persistence, protected navigation, privacy consent capture, Settings consent updates, and deletion request creation are implemented and manually QA'd against emulators.
- Firebase Functions have a clean placeholder registry for deferred workflows and an active trusted `userDataDeletion` trigger.
- Deletion processing is explicit, idempotent, audited, emulator-tested, and scoped to the requesting user.
- Firestore rules enforce user ownership for current user-owned collections and deny client-owned deletion lifecycle transitions.
- Storage rules are private by user path and deny public access.
- Wardrobe upload lifecycle now uses Firestore draft first, exact private Storage upload second, and trusted backend finalisation third.
- Shared helpers now create upload drafts, build/validate required metadata, detect backend-owned wardrobe fields, create safe upload failure payloads, and block analysis requests without `wardrobePhotoAnalysis` consent.
- Functions helpers now verify wardrobe Storage objects, mark existing uploads uploaded or failed, write safe audit entries, and keep AI analysis unstarted.
- Orphan detection now reports missing records/files, stale `upload_pending` records, `upload_failed` records, and metadata mismatches without deleting anything.
- Emulator rules and deletion trigger tests cover cross-user denial, public Storage denial, deletion tombstone retention, audit logs, Auth deletion, and unaffected-user protection.
- Shared TypeScript contracts cover the foundation model set and now include consistent IDs/timestamps on style, avatar, and recommendation records.

## What Is Risky

- Firestore rules still validate ownership more strongly than field shape for most user-owned collections.
- Storage rules enforce content type, max file size, upload metadata, and path-to-metadata consistency for upload paths. They still cannot verify bytes against MIME claims, run moderation/malware checks, or prove Firestore document existence before upload.
- Admin access is still a placeholder local session. Real admin access requires Firebase Auth, custom claims or trusted role issuance, and owner bootstrap.
- User-owned `users/{uid}` writes are currently client writable for the signed-in owner. That is acceptable for the foundation, but production should move sensitive lifecycle fields to trusted backend writes.
- Wardrobe upload lifecycle plumbing is implemented, but real wardrobe image upload UI is intentionally not implemented. AI, avatar, payments, shopping, and recommendation flows remain intentionally not implemented.
- The existing untracked `functions/src/placeholders/userDataDeletion.ts` duplicates the active trigger name conceptually. It is not exported, but it should be removed or renamed by the owner before it becomes confusing.

## Must Be Fixed Before Wardrobe Upload

- Rule-level Storage checks for allowed image MIME types, maximum file size, required owner metadata, required path ID metadata, and consent version metadata are implemented and emulator-tested.
- Firestore field-level validation for `wardrobeItems`, including `userId`, `storagePath`, private visibility, timestamps, source, analysis status, and allowed enum values is implemented and emulator-tested.
- Storage paths under `users/{uid}/wardrobe/{itemId}/original` now deny oversized files, disallowed content types, mismatched owner metadata, mismatched item metadata, unauthenticated writes, and cross-user writes.
- Keep the selected lifecycle: Firestore draft first, Storage object second, trusted Function finalisation third.
- Add full Storage trigger emulator integration for `wardrobeUploadFinalisation`.
- Operationally approve server-side retention and deletion behavior for failed or orphaned upload objects before enabling destructive cleanup.
- Rerun installed-development-build mobile manual QA after upload-adjacent changes.

## What Can Wait

- AI recommendation generation.
- Avatar and virtual try-on.
- Payments and subscription enforcement.
- Shopping and affiliate integrations.
- Production admin dashboards beyond protected shell and role model.
- Production analytics and marketing email integrations.
- Full legal retention design for payment/provider records, because payment is not active yet.

## Release Blockers

- Full Storage trigger emulator coverage for wardrobe upload finalisation is not complete.
- Real wardrobe image upload UI remains blocked until installed-development-build mobile QA is rerun after these upload-adjacent changes.
- Firestore field validation is incomplete for sensitive non-wardrobe user-owned data.
- Real admin authentication and role issuance are not implemented.
- Production Firebase project configuration and trusted owner bootstrap are not verified.
- Mobile manual QA must be rerun after any auth, privacy, navigation, rules, or upload-boundary change.

## Technical Debt

- Placeholder Functions are intentionally broad and should stay not-implemented until their phase starts.
- Admin placeholder auth should be replaced before any real operational data is exposed.
- Shared validation remains lightweight metadata, not a server-side validator.
- Historical QA notes include older states and should be read with the latest status sections first.
- The local untracked duplicate deletion placeholder should be cleaned up outside this review if it is not intentional work-in-progress.

## Security Concerns

- No cross-user read/write issue was found in the reviewed rules and deletion processor.
- No public Storage path was found.
- The deletion lifecycle correctly keeps client writes to `requested` only and backend ownership of later states.
- Audit logging avoids private Storage object names and raw sensitive styling data.
- Admin escalation remains the main unresolved boundary because custom claims and trusted role assignment are not active.
- Upload-specific rule controls and lifecycle helpers are now in place, but real wardrobe images still need full trigger integration coverage, non-destructive cleanup operational approval, and manual QA before upload UI.

## Test Gaps

- Admin allow-path rules tests through `adminUsers` role documents.
- Firestore field-level validation tests for user profile, consent, style profile, avatar profile, and recommendation payloads.
- Firestore or Storage outage drills for the deletion processor.
- End-to-end mobile rerun after the schema/doc review changes.
- Full trigger integration tests across Auth, Firestore, Storage, finalisation, and cleanup.

## Verification

The requested pnpm gate suite passed on 2026-06-15 using the project fallback pnpm binary and bundled Node runtime. The Firebase CLI emitted the known Java 21 future-requirement warning; pnpm install also repeated the known ignored `re2` build-script warning. Neither blocked the current gates.

## Recommended Next Agent

Recommended next agent: Wardrobe Onboarding Foundation Agent.

That agent should build non-image wardrobe onboarding foundations only: explicit user-provided style, fit, modesty, and context preference capture. Real wardrobe image upload UI should wait for a later Upload UI Readiness Agent after full Storage trigger emulator coverage, installed development-build QA, and retention/cleanup approval.
