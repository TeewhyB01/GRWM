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

- Wardrobe: `itemId` must equal `{itemId}`.
- Style photos: `photoId` must equal `{photoId}`.
- Avatar source photos: `photoId` must equal `{photoId}`.
- Outfits: `outfitId` must equal `{outfitId}`.

Storage rules can validate request metadata, MIME type, file size, and path ownership. They cannot prove that the bytes truly match the claimed MIME type, cannot run malware/moderation checks, and do not verify a matching Firestore document or consent record. Those checks must be handled by trusted backend coordination and cleanup.

## Firestore Wardrobe Item Boundary

`wardrobeItems/{itemId}` is client-writable only by the signed-in owner and only with the pre-upload metadata shape.

Required fields:

- `id`
- `userId`
- `name`
- `category`
- `primaryColour`
- `colorTags`
- `seasonTags`
- `occasionTags`
- `storagePath`
- `visibility`
- `source`
- `analysisStatus`
- `analysisConsentVersion`
- `createdAtIso`
- `updatedAtIso`

Client-created wardrobe records must use:

- `id == {itemId}`
- `userId == request.auth.uid`
- `storagePath == users/{userId}/wardrobe/{itemId}/original`
- `visibility == private`
- `source == manual` or `import`
- `analysisStatus == not_requested`
- `analysisConsentVersion == ""`

Client updates cannot change `id`, `userId`, `storagePath`, `source`, `createdAtIso`, `analysisStatus`, or `analysisConsentVersion`. Backend-owned analysis lifecycle changes remain blocked until a trusted function is implemented and consent-gated.

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
- own read allowed
- cross-user read denied
- broad list denied
- generated avatar client write/delete denied
- own wardrobe delete allowed
- cross-user delete denied

Firestore rules tests cover:

- valid wardrobe item create
- userId mismatch denial
- missing required field denial
- immutable owner denial
- backend-owned analysis field denial
- own read allowed
- cross-user read/write denied
- unauthenticated read/write denied
- invalid analysis status denial
- valid non-AI user update allowed

## Current Status

The rule-level upload security boundary is hardened enough for the next backend coordination design step. Real wardrobe image upload UI is still blocked until the upload lifecycle is finalized, consent checks are wired at the request point, orphan cleanup is implemented or operationally accepted, and mobile emulator QA is rerun in a development build.
