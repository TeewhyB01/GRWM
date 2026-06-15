# GRWM Architecture Review

Date: 2026-06-15

Architecture health rating: amber.

GRWM is clean enough to begin wardrobe onboarding foundation work, provided that onboarding continues to collect explicit user-provided preferences and does not upload images yet. GRWM is not ready for wardrobe upload until the release blockers below are addressed.

## What Is Solid

- Monorepo boundaries are clear: `apps/mobile`, `apps/admin`, `functions`, `packages/shared`, `firebase`, and `docs`.
- Package management is consistently pnpm-based in workspace scripts.
- Mobile uses Expo development builds with `expo-dev-client`; Expo Go remains explicitly unsupported.
- Mobile Auth, profile persistence, protected navigation, privacy consent capture, Settings consent updates, and deletion request creation are implemented and manually QA'd against emulators.
- Firebase Functions have a clean placeholder registry for deferred workflows and an active trusted `userDataDeletion` trigger.
- Deletion processing is explicit, idempotent, audited, emulator-tested, and scoped to the requesting user.
- Firestore rules enforce user ownership for current user-owned collections and deny client-owned deletion lifecycle transitions.
- Storage rules are private by user path and deny public access.
- Emulator rules and deletion trigger tests cover cross-user denial, public Storage denial, deletion tombstone retention, audit logs, Auth deletion, and unaffected-user protection.
- Shared TypeScript contracts cover the foundation model set and now include consistent IDs/timestamps on style, avatar, and recommendation records.

## What Is Risky

- Firestore rules still validate ownership more strongly than field shape for most user-owned collections.
- Storage rules do not yet enforce content type, max file size, upload metadata, moderation state, or path-to-document consistency.
- Admin access is still a placeholder local session. Real admin access requires Firebase Auth, custom claims or trusted role issuance, and owner bootstrap.
- User-owned `users/{uid}` writes are currently client writable for the signed-in owner. That is acceptable for the foundation, but production should move sensitive lifecycle fields to trusted backend writes.
- Wardrobe, AI, avatar, payments, shopping, and upload flows are intentionally not implemented. Their docs and placeholders should not be mistaken for production readiness.
- The existing untracked `functions/src/placeholders/userDataDeletion.ts` duplicates the active trigger name conceptually. It is not exported, but it should be removed or renamed by the owner before it becomes confusing.

## Must Be Fixed Before Wardrobe Upload

- Add Storage rule checks for allowed image MIME types and maximum file size.
- Define required upload metadata, including owner ID, wardrobe item ID, and consent version where appropriate.
- Add Firestore field-level validation for `wardrobeItems`, including `userId`, `storagePath`, `visibility`, timestamps, and allowed enum values.
- Add tests that Storage paths under `users/{uid}/wardrobe/{itemId}/original` cannot be written with oversized files, disallowed content types, or mismatched owner/item metadata.
- Decide whether wardrobe upload creates the Firestore document first, Storage object first, or uses a trusted Function to coordinate both.
- Confirm wardrobe photo analysis consent is checked before any analysis job is queued.
- Define retention and deletion behavior for failed or orphaned upload objects.

## What Can Wait

- AI recommendation generation.
- Avatar and virtual try-on.
- Payments and subscription enforcement.
- Shopping and affiliate integrations.
- Production admin dashboards beyond protected shell and role model.
- Production analytics and marketing email integrations.
- Full legal retention design for payment/provider records, because payment is not active yet.

## Release Blockers

- Storage upload constraints are incomplete for real wardrobe images.
- Firestore field validation is incomplete for sensitive user-owned data.
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
- Upload-specific controls are the main missing security boundary before wardrobe images are accepted.

## Test Gaps

- Admin allow-path rules tests through `adminUsers` role documents.
- Firestore field-level validation tests for user profile, consent, wardrobe item, style profile, avatar profile, and recommendation payloads.
- Storage MIME type, size, and metadata tests.
- Firestore or Storage outage drills for the deletion processor.
- End-to-end mobile rerun after the schema/doc review changes.
- Future upload coordination tests across Auth, Firestore, Storage, and deletion cleanup.

## Verification

The requested pnpm gate suite passed on 2026-06-15 using the project fallback pnpm binary and bundled Node runtime. The Firebase CLI emitted the known Java 21 future-requirement warning, and the Functions emulator emitted the known host Node 24 versus requested Node 20 warning; neither blocked the current gates.

## Recommended Next Agent

Recommended next agent: Firebase Storage Upload Security Agent.

That agent should harden Storage and `wardrobeItems` rules, define upload metadata, add emulator tests, and document the exact upload lifecycle before any wardrobe upload UI is built.
