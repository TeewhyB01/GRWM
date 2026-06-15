# Storage Trigger QA

Date: 2026-06-15

## Scope

This QA verifies the wardrobe upload Storage finalisation boundary in Firebase emulators only. It uses synthetic Auth users, Firestore documents, and tiny synthetic image bytes. It does not use production Firebase credentials, mobile image upload UI, image picker, AI, avatar, payment, shopping, or affiliate workflows.

## Commands

Run any of these root pnpm aliases:

```bash
pnpm test:storage-trigger
pnpm test:wardrobe-upload-trigger
pnpm qa:wardrobe-upload:functions-emulator
```

Each alias builds Functions first, checks that `functions/lib/index.js` exists, starts isolated Auth/Firestore/Storage/Functions emulators, runs `firebase/tests/wardrobeUploadTrigger.integration.test.ts`, and shuts emulators down through `firebase emulators:exec`.

## Emulator Config

The trigger QA uses `firebase/firebase.functions-test.json` and project `demo-grwm-functions`.

- Auth: `127.0.0.1:9105`
- Firestore: `127.0.0.1:8095`
- Functions: `127.0.0.1:5005`
- Storage: `127.0.0.1:9197`
- Emulator hub: `127.0.0.1:4420`
- Logging: `127.0.0.1:4515`

The test asserts a demo project ID, emulator host variables, an empty `GOOGLE_APPLICATION_CREDENTIALS`, generated Functions build output, and the v2 endpoint metadata for `wardrobeUploadFinalisation`.

## Trigger Registration

The Functions emulator loads `wardrobeUploadFinalisation` as a Storage function. The exported endpoint is registered for `google.cloud.storage.object.v1.finalized` on bucket `demo-grwm-functions.appspot.com` in `us-central1`.

The Cloud Storage trigger itself is bucket-scoped. The function handler processes only paths accepted by `parseWardrobeUploadStoragePath`, which is the private wardrobe original path:

```text
users/{userId}/wardrobe/{itemId}/original
```

Style photos, generated avatar outputs, outfit paths, public paths, and unrelated objects are ignored without wardrobe item writes or audit logs.

## Emulator Delivery Note

In this local Firebase CLI run, Storage emulator writes registered successfully but did not automatically deliver v2 Storage finalize events to the Functions emulator. To keep the QA deterministic, the integration test writes the object to the Storage emulator, then invokes the registered exported function handler with the finalized object payload. Firestore/Auth/Storage state remains emulator-only, and emulator registration is asserted separately.

## Covered

- Valid upload marks `wardrobeItems/{itemId}` as `uploaded`.
- Backend-owned finalisation fields are set by trusted code.
- `analysisStatus` remains `not_requested`; it is not completed.
- No `aiJobs` document is created.
- Audit logs are written without private object paths.
- Missing `wardrobePhotoAnalysis` consent does not block private upload finalisation.
- Metadata mismatch fails safely with `upload_failed`.
- Missing wardrobe records are audited without creating partial items.
- Cross-user item ID collisions do not touch the other user's wardrobe item.
- Admin-bypassed invalid content type and oversized objects are rejected by finalisation.
- Duplicate finalise events leave uploaded items stable and avoid duplicate finalisation audits.
- Non-wardrobe Storage paths are ignored.

## Orphan Coordination

Non-destructive orphan detection remains covered by Functions unit tests. It identifies Storage objects without matching wardrobe records, stale `upload_pending` records, wardrobe records with missing Storage objects, `upload_failed` records needing review, and metadata/storagePath mismatches.

Destructive cleanup remains disabled.

## Still Blocked

Real wardrobe image upload UI is now approved for the next Wardrobe Image Upload UI Agent after installed-development-build wardrobe onboarding manual QA and upload UI readiness both passed on 2026-06-15. The current mobile app still has no image picker or Firebase Storage upload UI; those belong only to the next approved MVP scope.

The local emulator delivery limitation should be rechecked when Firebase Tools or the Functions runtime changes. Before production enablement, verify deployed Storage events in a non-production Firebase project.
