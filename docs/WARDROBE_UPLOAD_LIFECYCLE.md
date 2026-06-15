# Wardrobe Upload Lifecycle

Date: 2026-06-15

This document defines the privacy-first lifecycle for future wardrobe image uploads. The lifecycle foundation is now implemented across shared TypeScript contracts, Firestore rules, Storage rules, backend finalisation helpers, and non-destructive orphan detection. The mobile image picker and real upload button UI are still blocked.

## Lifecycle

1. The user records privacy consent before any wardrobe upload draft is created.
2. The app creates `wardrobeItems/{itemId}` first with `userId`, `ownerId`, `itemId`, the generated private `storagePath`, `uploadStatus: upload_pending`, `analysisStatus: not_requested`, placeholder category/colour values, timestamps, and `source: manual` or `import`.
3. The app uploads the private image to Firebase Storage at the exact generated path: `users/{userId}/wardrobe/{itemId}/original`.
4. The upload must include custom metadata: `ownerId`, `userId`, `itemId`, `uploadCategory: wardrobe-original`, `consentVersion`, and `storagePath`.
5. Storage rules enforce authenticated ownership, allowed image MIME type, 10 MiB max size, matching metadata, no public access, no broad list access, and no generated-output writes.
6. The backend Storage finalisation service verifies the object path, metadata, MIME type, size, matching Firestore record, owner fields, item ID, and stored path.
7. The backend marks `uploadStatus: uploaded` only after verification succeeds. Clients cannot set `uploaded`.
8. If verification fails, the backend marks an existing item as `upload_failed` with a safe failure reason and writes an audit entry that does not expose image content or object names. Missing Firestore records are audited without creating partial wardrobe items.
9. Uploading and analysing are separate. Upload finalisation does not start AI analysis.
10. A future analysis request must check `wardrobePhotoAnalysis` consent before any job is created. Missing consent returns `blocked_missing_consent`; no AI provider is called.
11. Failed or abandoned uploads are reported by non-destructive orphan detection until cleanup deletion is fully tested and approved.

## Client-Creatable Draft Fields

Clients may create only their own draft or upload-pending wardrobe item:

- `id` and `itemId`: both equal the Firestore document ID.
- `userId` and `ownerId`: both equal `request.auth.uid`.
- `storagePath`: equals `users/{userId}/wardrobe/{itemId}/original`.
- `uploadStatus`: `draft` or `upload_pending`.
- `analysisStatus`: `not_requested`.
- `analysisConsentVersion`: empty string.
- `uploadFailureReason`, `uploadedAtIso`, `uploadFailedAtIso`: empty strings.
- `visibility`: `private`.
- `source`: `manual` or `import`.

Clients can update only user-editable wardrobe metadata such as name, category, colour/tags, visibility, and `updatedAtIso`. Owner fields, path, source, upload lifecycle fields, analysis lifecycle fields, and creation timestamp are backend-owned after creation.

## Backend Finalisation

The service in `functions/src/wardrobeUpload/` provides:

- `verifyWardrobeStorageObject()`
- `finaliseWardrobeUpload()`
- `markWardrobeUploadFailed()`
- `evaluateWardrobeAnalysisRequest()`
- `wardrobeUploadFinalisation` Storage `onObjectFinalized` trigger

The trigger is bucket-scoped through `FIREBASE_STORAGE_BUCKET`, with an emulator-safe demo fallback for local tests. Helper-level tests cover the finalisation behaviour, and `firebase/tests/wardrobeUploadTrigger.integration.test.ts` now verifies trigger endpoint registration plus upload finalisation lifecycle behaviour against Auth, Firestore, Storage, and Functions emulators.

Local emulator note: Firebase Tools loaded `wardrobeUploadFinalisation` as a Storage function, but Storage emulator writes did not auto-deliver v2 finalize events in this environment. The integration test writes synthetic objects to the Storage emulator and invokes the registered exported handler with the finalized object payload. Recheck automatic delivery when Firebase Tools or runtime versions change.

## Orphan Detection

`functions/src/storage/orphanCleanup.ts` remains non-destructive. It identifies:

- Storage files with no matching wardrobe item.
- Wardrobe items with missing Storage files.
- `upload_pending` records older than the safe threshold.
- `upload_failed` records needing review.
- Storage objects whose metadata does not match the path.

Deletion, quarantine, or retention enforcement must not be enabled until the logic is integration-tested and documented.

## Current Readiness

Safe now:

- Wardrobe onboarding foundation work that collects explicit user-provided preferences.
- Firestore draft record creation design.
- Storage upload security boundary, backend finalisation helper tests, and emulator-backed trigger handler QA.
- Consent-gated future analysis request helper.
- Non-destructive orphan detection.

Still blocked:

- Real wardrobe image picker/upload UI.
- AI analysis jobs.
- Avatar, payment, shopping, and recommendation workflows.
- Destructive orphan cleanup.
- Wardrobe onboarding installed-development-build manual QA after upload-adjacent changes.
- Production-like automatic Storage event delivery verification in a non-production Firebase project before enabling real uploads.
