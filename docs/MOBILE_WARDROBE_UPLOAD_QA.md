# Mobile Wardrobe Upload QA

Date: 2026-06-15

Status: pending. Do not mark passed until this checklist is run on a rebuilt installed development build.

## Required Setup

- Rebuild the installed `com.grwm.mobile` development build after adding `expo-image-picker` and changing `apps/mobile/app.json`.
- Do not use Expo Go.
- Use pnpm commands only.
- Use local Firebase emulators for Auth, Firestore, Storage, and Functions.
- Confirm `apps/mobile/.env.local` remains ignored and untracked.

## Checklist

- Install/reinstall the rebuilt development build.
- Start Metro with the development-client flow.
- Sign in or use the guarded local QA access button.
- Save privacy consent through the app UI.
- Complete wardrobe setup through the app UI.
- Open Wardrobe Home and confirm `Add wardrobe item` is visible after setup is completed.
- Tap `Add wardrobe item`.
- Confirm private upload copy is visible.
- Confirm AI analysis copy says AI analysis is off and no analysis starts.
- Trigger the photo library permission prompt.
- Confirm permission copy is privacy-first.
- Choose a valid JPEG, PNG, WebP, HEIC, or HEIF image.
- Confirm category is required.
- Confirm primary colour is required.
- Confirm unsupported or unknown content type is rejected before upload.
- Confirm oversized image is rejected before upload.
- Confirm `wardrobeItems/{itemId}` is created before the Storage upload.
- Confirm the draft has `userId == auth.uid`, `ownerId == auth.uid`, `source: manual`, `visibility: private`, `uploadStatus: upload_pending`, and `analysisStatus: not_requested`.
- Confirm the Storage file uploads to `users/{userId}/wardrobe/{itemId}/original`.
- Confirm Storage metadata includes `ownerId`, `userId`, `itemId`, `category`, `uploadCategory: wardrobe-original`, `consentVersion`, and exact `storagePath`.
- Confirm upload progress is visible.
- Confirm the UI shows `Processing upload` after Storage upload completes.
- Confirm backend finalisation marks the item `uploaded`.
- Confirm failed finalisation shows a safe error without exposing private object names.
- Confirm timeout shows `Upload saved, still processing` and lets the user leave.
- Confirm Wardrobe Home displays the item, category, primary colour, upload status, analysis status, and private thumbnail/fallback.
- Confirm no `aiJobs` document is created.
- Confirm no `outfitRecommendations`, `avatarProfiles`, shopping, payment, affiliate, or public sharing records are created.
- Confirm logout protects the add screen.
- Confirm cross-user reads/writes are denied by Firestore and Storage rules.
- Confirm the local QA access harness still does not create `wardrobeItems`, Storage files, or `aiJobs` by itself.
- Confirm deletion later removes the wardrobe record and private Storage path through the trusted deletion workflow.

## Expected Current Limitation

Camera and microphone permissions are disabled through the ImagePicker config plugin where supported. The app never calls camera APIs. Android generated permissions should still be inspected after rebuild because native permission manifests are generated during the development-build process.

## Evidence To Capture

- Screenshot of the photo-library permission prompt.
- Screenshot of the add screen privacy copy.
- Screenshot of progress.
- Screenshot of processing or uploaded status.
- Firestore snapshot of the draft before upload finalisation if possible.
- Storage metadata snapshot.
- Firestore snapshot after finalisation.
- Emulator query showing zero `aiJobs`.

## Result

Pending. This checklist has not been run for the new upload UI.
