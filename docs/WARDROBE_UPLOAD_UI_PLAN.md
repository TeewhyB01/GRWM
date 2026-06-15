# Wardrobe Upload UI Plan

Date: 2026-06-15

Status: approved next implementation scope after `docs/UPLOAD_UI_READINESS.md`.

This plan defines the only upload UI work the next Wardrobe Image Upload UI Agent may build.

## Allowed Scope

The next agent may build:

- Add wardrobe item screen.
- Route from Wardrobe Home to the add item screen.
- Device image selection for one private wardrobe image.
- Client-side image validation before upload:
  - allowed MIME types from `packages/shared/src/uploadPolicy.ts`
  - max file size from `MAX_WARDROBE_IMAGE_BYTES`
  - single-image selection only for the MVP
- Firestore draft creation before Storage upload.
- Draft data through shared helpers, including exact `userId`, `ownerId`, `itemId`, `storagePath`, `uploadStatus: upload_pending`, `analysisStatus: not_requested`, and private visibility.
- Firebase Storage upload to exactly `users/{userId}/wardrobe/{itemId}/original`.
- Required Storage custom metadata through shared helpers:
  - `ownerId`
  - `userId`
  - `itemId`
  - `uploadCategory: wardrobe-original`
  - `consentVersion`
  - `storagePath`
- Upload progress state.
- Upload success state while waiting for backend finalisation.
- Upload failure state with a safe error message.
- Retry and cancel behavior.
- Wardrobe list/empty-state update that shows uploaded or pending user-owned items.
- Backend finalisation as the only path that marks `uploadStatus: uploaded`.
- Consent-aware future analysis option only as disabled or placeholder copy if needed.

## Required Flow

1. Require signed-in auth state.
2. Require an existing recorded `privacyConsents/{userId}` document before creating a draft.
3. Let the user select exactly one image from device photo library.
4. Validate selected asset MIME type and file size before Firestore draft creation where the asset exposes those values.
5. Generate a safe item ID.
6. Build draft data with `createWardrobeUploadDraftData`.
7. Create `wardrobeItems/{itemId}` first.
8. Build upload metadata with `buildWardrobeUploadMetadataForDraft`.
9. Upload the file to the draft's exact `storagePath`.
10. Show progress during upload.
11. Do not mark the item uploaded from the client.
12. Let the Storage finalisation handler mark `uploadStatus: uploaded`.
13. Show the item in the wardrobe list according to its lifecycle state.

## Non-Goals

The next agent must not build:

- AI image analysis.
- AI job creation.
- Automatic outfit generation.
- Avatar generation.
- Virtual try-on.
- Shopping recommendations.
- Payment or subscription enforcement.
- Affiliate links or click tracking UI.
- Public wardrobe sharing.
- Stylist sharing.
- Generated avatar output writes.
- Destructive orphan cleanup.
- Production deployment.
- Production Firebase project enablement.
- Camera capture, unless explicitly approved in a later scope.
- Multi-image batch upload, unless explicitly approved in a later scope.

## Acceptance Criteria

Private image selection:

- User can choose a single image from device photo library in an installed development build.
- The picker is not accessible while signed out.
- The screen explains that the image will be uploaded privately to the user's account.

File validation:

- Reject unsupported MIME types before upload when the picker provides MIME type.
- Reject files larger than `MAX_WARDROBE_IMAGE_BYTES` before upload when the picker provides file size.
- Treat missing MIME type or file size conservatively with clear fallback validation and backend-safe error handling.
- Never upload videos for the wardrobe image MVP.

Draft creation:

- Create `wardrobeItems/{itemId}` before Storage upload.
- Use shared lifecycle helpers for draft shape and path generation.
- Draft must be owner-bound to the signed-in user.
- Draft must use `visibility: private`.
- Draft must use `uploadStatus: upload_pending`.
- Draft must use `analysisStatus: not_requested`.
- No Storage upload should start if draft creation fails.

Storage upload:

- Upload only to the exact `storagePath` stored on the draft.
- Include all required custom metadata.
- Metadata values must match the draft and authenticated user.
- Use resumable upload if Firebase web SDK support is viable in React Native; otherwise document the selected upload method and keep progress behavior honest.

Progress, retry, and cancel:

- Show upload progress while bytes are transferring.
- Show a safe success/pending state after Storage upload completes.
- Show a safe error state if draft creation or upload fails.
- Retry must reuse or safely recreate state without cross-user writes.
- Cancel must stop any active upload where supported and leave no extra client-side lifecycle tampering.

Security and privacy:

- No upload without auth.
- No upload without recorded privacy consent.
- No cross-user write.
- No client write to backend-owned uploaded/failure/analysis fields.
- No AI job creation.
- No analysis request by default.
- No public Storage path or download URL display.
- No private object names in user-facing error copy.
- No `.env.local` or secrets committed.

Failure cleanup:

- If upload fails after draft creation, mark only safe client-owned metadata where rules allow, or leave the draft in `upload_pending`/client-visible failed UI for backend/orphan review.
- Do not use client code to set `upload_failed`, `uploaded`, or analysis fields.
- Avoid orphan records where practical by creating the draft only after local asset validation and before immediate upload.

Tests:

- Add mobile unit tests for upload draft payload construction, validation decisions, metadata construction, auth/consent gating, and no AI side effects.
- Keep shared tests green.
- Keep Firestore rules tests green.
- Keep Storage rules tests green.
- Keep `pnpm test:wardrobe-upload-trigger` green.
- Add or update rules tests only if the UI exposes a newly required rules behavior.

Manual QA:

- Use an installed `com.grwm.mobile` development build only.
- Do not use Expo Go.
- Rebuild the development build after adding `expo-image-picker` or changing native app config.
- Run the existing auth/privacy/wardrobe onboarding checks.
- Verify select image, validation failure, draft create, upload progress, success/pending state, backend finalisation to uploaded, retry/cancel, logout protection, and Settings privacy alignment.
- Confirm no `aiJobs`, `outfitRecommendations`, `avatarProfiles`, shopping, payment, affiliate, or public sharing records are created.

## Dependency Plan

`expo-image-picker` is the recommended dependency for the next agent because the app already uses Expo development builds. It is not currently installed.

Install with pnpm through the Expo install command:

```bash
pnpm --filter mobile expo install expo-image-picker
```

If pnpm is not on PATH:

```bash
/Users/olutayooladeinbo/Documents/IAttend\ 2/.tools/bin/pnpm --filter mobile expo install expo-image-picker
```

Add its config plugin in `apps/mobile/app.json` and rebuild the development build. Suggested first-MVP plugin intent:

- Photo library permission: private wardrobe upload only.
- Camera permission: `false`.
- Microphone permission: `false`.

The next agent should verify the exact generated iOS and Android native permission set before manual QA.

## Handoff Decision

Next recommended agent: Wardrobe Image Upload UI Agent.

The agent should build only the private image upload MVP above, then run the full pnpm gate suite and installed-development-build manual QA before any production discussion.
