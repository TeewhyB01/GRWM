# Wardrobe Image Upload UI

Date: 2026-06-15

Status: implemented for the private mobile MVP. Manual QA is pending until the installed development build is rebuilt with `expo-image-picker`.

## Scope Implemented

- Checked for `docs/MOBILE_WARDROBE_ONBOARDING_QA_REPORT 2.md`; no duplicate file was present, so no merge or removal was needed.
- `AddWardrobeItemScreen`
- `WardrobeImagePickerSection`
- Inline upload preview
- `WardrobeUploadProgress`
- `WardrobeUploadError`
- `WardrobeItemCard`
- `WardrobeList` in `WardrobeHomeScreen`
- Protected hidden route: `addWardrobeItem`

The UI supports one private wardrobe image at a time from the device photo library. It does not use camera capture, microphone APIs, AI analysis, avatar generation, outfit generation, shopping, payment, affiliate links, public sharing, or destructive orphan cleanup.

## Dependency And Native Config

Installed dependency:

```bash
pnpm --filter mobile exec expo install expo-image-picker
```

Because `expo-image-picker` is a native dependency and `apps/mobile/app.json` now includes its config plugin, the installed development build must be rebuilt before manual QA. Expo Go remains unsupported.

iOS photo-library permission copy:

```text
GRWM uses your selected wardrobe photos only to help you organise and style clothes you own. Your wardrobe stays private.
```

The config plugin sets `cameraPermission: false` and `microphonePermission: false`. The app only calls `requestMediaLibraryPermissionsAsync` and `launchImageLibraryAsync` with `mediaTypes: ["images"]`; it never calls camera APIs.

## Upload Flow

1. Signed-in user opens Wardrobe Home.
2. User taps `Add wardrobe item`.
3. Add screen checks wardrobe setup is completed.
4. User sees private upload copy and AI-off copy.
5. User chooses one image from the photo library.
6. Client validates auth, file URI, image asset type, content type, size if exposed by the picker, category, primary colour, safe storage path, and shared metadata.
7. Client reads the current `privacyConsents/{userId}` document.
8. Client creates `wardrobeItems/{itemId}` first with `uploadStatus: upload_pending`, `analysisStatus: not_requested`, `source: manual`, `visibility: private`, and no backend finalisation claims.
9. Client uploads bytes to `users/{userId}/wardrobe/{itemId}/original`.
10. Upload metadata includes `ownerId`, `userId`, `itemId`, `category`, `uploadCategory: wardrobe-original`, `consentVersion`, and the exact `storagePath`.
11. UI shows progress and then `Processing upload`.
12. UI listens for backend finalisation on `wardrobeItems/{itemId}`.
13. Backend marks `uploaded` or `upload_failed`.
14. On timeout, UI shows `Upload saved, still processing` and lets the user return to Wardrobe.

The client never marks `uploaded` or `upload_failed` and never creates `aiJobs`.

## Wardrobe List

Wardrobe Home listens for `wardrobeItems` where `userId == auth.uid`. It displays:

- empty state when there are no items
- uploaded, processing, and failed items
- category
- primary colour
- upload status
- analysis status
- optional notes
- owner-gated thumbnail when Firebase Storage grants an authenticated read URL

Private Storage paths are not shown to the user.

## Failure Handling

If local validation fails, no Firestore or Storage write starts.

If draft creation fails, no Storage upload starts.

If upload fails after draft creation, the client shows a safe error and does not set backend-owned lifecycle fields. Pending drafts and orphan review remain server-side cleanup concerns; destructive cleanup is still out of scope.

## Non-Goals Still Blocked

- AI wardrobe analysis
- AI job creation
- outfit generation
- avatar or try-on workflows
- shopping, payment, affiliate flows
- public or stylist sharing
- production deployment
- destructive orphan cleanup

## Verification Status

Automated tests were added for local image validation, draft/metadata construction, upload gating, draft-first sequencing, route presence, permission config, UI copy, QA access side-effect safety, and no AI job creation.

Manual QA has not passed yet. Rebuild the installed development build, then run `docs/MOBILE_WARDROBE_UPLOAD_QA.md`.
