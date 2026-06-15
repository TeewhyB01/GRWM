# Storage Upload Security

Date: 2026-06-15

This document defines the private Firebase Storage upload boundary for GRWM before any real wardrobe image upload UI is built.

## Allowed Client Uploads

All client-accessible Storage objects must live under the authenticated user's private path:

- `users/{userId}/wardrobe/{itemId}/original`
- `users/{userId}/style-photos/{photoId}/original`
- `users/{userId}/avatar/source/{photoId}/original`
- `users/{userId}/outfits/{outfitId}`

Generated avatar outputs live at `users/{userId}/avatar/generated/{generationId}`, but they are backend-owned and not client-writable.

Allowed image MIME types for wardrobe, style photo, and avatar source uploads are:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/heic`
- `image/heif`

Current client upload size limits:

- Wardrobe image original: 10 MiB.
- Style photo original: 10 MiB.
- Avatar source photo original: 10 MiB.
- Outfit image asset: 10 MiB.
- Generated avatar output: 15 MiB policy constant, backend-owned only.

Shared constants live in `packages/shared/src/uploadPolicy.ts`.

## Required Upload Metadata

Client uploads must include custom metadata that binds the object to the authenticated owner and path variable.

All client-writable uploads require:

- `ownerId`: must equal `request.auth.uid` and the `{userId}` path segment.
- `userId`: must equal `request.auth.uid` and the `{userId}` path segment.
- `uploadCategory`: must match the path category.
- `consentVersion`: must be present and non-empty.

Path-specific metadata:

- Wardrobe: `itemId` must equal `{itemId}`, and `storagePath` must equal `users/{userId}/wardrobe/{itemId}/original`.
- Style photos: `photoId` must equal `{photoId}`.
- Avatar source photos: `photoId` must equal `{photoId}`.
- Outfits: `outfitId` must equal `{outfitId}`.

Storage rules can validate request metadata, MIME type, file size, and path ownership. They cannot prove that the bytes truly match the claimed MIME type, cannot run malware/moderation checks, and do not verify a matching Firestore document or consent record. Those checks must be handled by trusted backend coordination and cleanup.

## Firestore Wardrobe Item Boundary

`wardrobeItems/{itemId}` is client-writable only by the signed-in owner and only with the pre-upload metadata shape.

Required fields:

- `id`
- `itemId`
- `userId`
- `ownerId`
- `name`
- `category`
- `primaryColour`
- `colorTags`
- `seasonTags`
- `occasionTags`
- `storagePath`
- `visibility`
- `source`
- `uploadStatus`
- `uploadFailureReason`
- `uploadedAtIso`
- `uploadFailedAtIso`
- `analysisStatus`
- `analysisConsentVersion`
- `createdAtIso`
- `updatedAtIso`

Client-created wardrobe records must use:

- `id == {itemId}`
- `itemId == {itemId}`
- `userId == request.auth.uid`
- `ownerId == request.auth.uid`
- `storagePath == users/{userId}/wardrobe/{itemId}/original`
- `visibility == private`
- `source == manual` or `import`
- `uploadStatus == draft` or `upload_pending`
- `uploadFailureReason == ""`
- `uploadedAtIso == ""`
- `uploadFailedAtIso == ""`
- `analysisStatus == not_requested`
- `analysisConsentVersion == ""`

Client updates cannot change `id`, `itemId`, `userId`, `ownerId`, `storagePath`, `source`, `createdAtIso`, upload lifecycle fields, `analysisStatus`, or `analysisConsentVersion`. Backend-owned upload lifecycle changes now flow through the wardrobe upload finalisation service. Backend-owned analysis lifecycle changes remain blocked until a trusted analysis workflow is implemented and consent-gated.

## Upload Lifecycle Coordination

The Firestore document is created first, then the private Storage object is uploaded to the exact generated path. The backend finalisation helper verifies path, metadata, MIME type, size, owner fields, item ID, stored `storagePath`, and matching `wardrobeItems/{itemId}` before marking `uploadStatus: uploaded`.

If verification fails, an existing item can be marked `upload_failed` with a safe failure reason. Missing Firestore records are audited without creating partial records. The finaliser does not start AI analysis.

## Consent Gates

Shared consent helpers live in `packages/shared/src/consentGates.ts`.

- `canUploadWardrobePhoto(consent)` allows private wardrobe photo upload only after a privacy consent document exists.
- `canRequestWardrobePhotoAnalysis(consent)` requires `wardrobePhotoAnalysis`.
- `canUseLocationWeather(consent)` requires `locationWeatherUse`.
- `canCreateAvatar(consent)` requires `avatarCreation`.

Uploading a private wardrobe photo does not imply consent for AI analysis. Analysis jobs must call the analysis gate before queuing any future work.

## Orphan Cleanup Plan

The scaffold in `functions/src/storage/orphanCleanup.ts` detects:

- Storage objects under wardrobe original paths with no matching `wardrobeItems.storagePath`.
- `wardrobeItems` records whose `storagePath` has no matching Storage object.
- `upload_pending` records older than the safe threshold.
- `upload_failed` records that need review.
- Storage objects whose metadata does not match the path.

No destructive cleanup is active. Cleanup must run server-side because it compares private Storage and Firestore state, needs trusted Admin SDK access, should be audit logged, and must be retry-safe. A future worker should quarantine or delete failed uploads only after a retention window and after verifying the user-owned Firestore record state.

## Emulator Coverage

Storage rules tests cover:

- valid wardrobe upload
- invalid content type denial
- oversized upload denial
- unauthenticated upload denial
- cross-user upload denial
- owner metadata mismatch denial
- item metadata mismatch denial
- storage path metadata mismatch denial
- own read allowed
- cross-user read denied
- broad list denied
- generated avatar client write/delete denied
- own wardrobe delete allowed
- cross-user delete denied

Firestore rules tests cover:

- valid wardrobe item create
- userId mismatch denial
- ownerId mismatch denial
- client-created `uploaded` denial
- client-created completed analysis denial
- missing required field denial
- immutable owner denial
- immutable path/source denial
- backend-owned upload lifecycle field denial
- backend-owned analysis field denial
- own read allowed
- cross-user read/write denied
- unauthenticated read/write denied
- invalid analysis status denial
- valid non-AI user update allowed

Backend helper tests cover valid finalisation, metadata mismatch, missing records, user mismatch, content type and size failures, and consent-blocked analysis request decisions.

Storage trigger QA covers:

- generated `functions/lib/index.js` before emulator startup
- Functions emulator definition loading
- `wardrobeUploadFinalisation` registered as a v2 Storage finalize function
- private wardrobe original path processing only
- ignored style photo, generated avatar, outfit, public, and unrelated Storage paths
- valid upload finalisation to `uploaded`
- missing `wardrobePhotoAnalysis` consent preserving upload finalisation while creating no AI job
- metadata mismatch, missing record, cross-user collision, invalid content type, oversized object, and duplicate finalise behaviour

See `docs/STORAGE_TRIGGER_QA.md`.

## Current Status

The upload lifecycle foundation is defined, helper-tested, rules-tested, and covered by emulator-backed trigger handler QA. Wardrobe onboarding manual QA passed on the installed `com.grwm.mobile` development build on 2026-06-15.

GRWM is ready for the Wardrobe Image Upload UI Agent to build the private upload UI MVP. The next agent must keep the same boundary: Firestore draft first, exact private Storage upload second, trusted backend finalisation third, and no AI analysis by default.

Production upload enablement still requires deployed Storage event verification in a non-production Firebase project. Destructive orphan cleanup remains disabled until separately tested and approved.

See `docs/WARDROBE_UPLOAD_LIFECYCLE.md` for the end-to-end lifecycle and readiness boundary.
See `docs/UPLOAD_UI_READINESS.md` and `docs/WARDROBE_UPLOAD_UI_PLAN.md` for the current upload UI handoff.
