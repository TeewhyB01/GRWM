# GRWM Security And Privacy

## Baseline Requirements

- Firebase Authentication is required for user accounts.
- Cloud Firestore data must be scoped by user ownership and role.
- Firebase Storage uploads must be scoped to the authenticated user.
- Cloud Functions must validate authentication, authorization, and input shape.
- Sensitive user data must not be logged.

## Data Sensitivity

Wardrobe images, body-shape preferences, style preferences, and location-derived weather context can be sensitive. These data classes require clear consent, limited retention, and transparent controls.

## Foundation Controls

- Firestore rules now model user-owned collections and admin-only collections.
- Storage rules now allow access only under the authenticated user's own `users/{userId}` path and enforce upload MIME type, max size, required owner metadata, category metadata, path ID metadata, and consent version metadata for client-writable image paths.
- Wardrobe Storage rules also require `storagePath` metadata to match the exact private object path.
- Wardrobe upload lifecycle helpers now require Firestore draft creation before Storage upload, then trusted backend finalisation before `uploadStatus: uploaded`.
- Wardrobe onboarding preferences are stored under `wardrobeSetupProfiles/{userId}` with owner-bound Firestore rules, required fields, mobile source, setup status enums, and bounded category/style enums.
- Environment variables are documented but not committed with secrets.
- Privacy consent starts from opt-in false for wardrobe photo analysis, style photo analysis, avatar creation, location/weather use, AI recommendations, marketing emails, and analytics.
- Account deletion requests are modeled so deletion can be verified and audited.
- Account/data deletion is processed by the trusted `userDataDeletion` Cloud Function trigger, not by direct client deletion.
- Deletion audit logs record lifecycle events and non-sensitive counts without wardrobe, avatar, or photo object names.
- Functions emulator integration verifies the deletion trigger deletes only the requesting user's data, preserves admin collections, writes audit logs, deletes private Storage files, deletes the Auth emulator user, and leaves unaffected users intact.
- Shared consent gates now distinguish private wardrobe photo upload from wardrobe photo analysis, avatar creation, and location/weather use.
- Wardrobe upload finalisation writes safe audit entries without exposing image bytes or private object names.

## Current Rule Limitations

- The first admin owner must be bootstrapped with trusted Admin SDK credentials.
- Admin custom claims are not implemented yet.
- Firestore rules allow users to create only their own `requested` deletion request and deny client-side deletion status updates. Full field validation for every sensitive collection remains future work.
- Storage rules enforce MIME type, size, and request metadata for allowed upload paths, but cannot verify bytes against MIME claims, check Firestore document existence, check the user's consent document, or run moderation/malware scanning. The backend finalisation helper verifies Firestore existence and lifecycle ownership after upload.
- Additional production-like failure drills for Firestore or Storage outages are still needed before production data collection.
- `users/{uid}` is owner-writable for the foundation mobile signup flow. Before production, backend-owned account lifecycle fields such as `disabled`, `emailVerified`, and provider state should move behind trusted code or stricter rule validation.
- Admin web UI authentication is a placeholder and must not be connected to real operational data until Firebase Auth, role issuance, and owner bootstrap are implemented.

## Wardrobe Upload Security Status

- Wardrobe onboarding foundation is implemented without image picker UI, Storage upload, AI analysis, avatar, payment, or shopping features.
- Setup preferences are private, owner-keyed, and included in the trusted account deletion plan.
- Final lifecycle is Firestore draft first, exact private Storage upload second, trusted backend finalisation third.
- AI analysis remains separate from private upload. Future analysis requests are blocked unless `wardrobePhotoAnalysis` consent is true.
- Server-side orphan detection is expanded but remains non-destructive.
- Real wardrobe image upload UI is still blocked until full trigger emulator coverage and mobile manual emulator QA are rerun in an installed development build.
- Keep generated avatar outputs backend-owned; do not expose client avatar generation writes.

## Future Work

- Consent versioning UI.
- Audit log review and support tooling for failed deletion requests.
- Role-based access control for the admin dashboard.
- Privacy review before AI, avatar, shopping, or payment features.
- Storage moderation and malware/abuse scanning workflow before public launch.

See `docs/USER_DATA_DELETION.md` for deletion coverage, audit events, emulator-safe tests, and production readiness checks.
See `docs/ARCHITECTURE_REVIEW.md` for the latest architecture gate and wardrobe upload blockers.
See `docs/STORAGE_UPLOAD_SECURITY.md` for the current upload policy, metadata contract, and emulator coverage.
See `docs/WARDROBE_UPLOAD_LIFECYCLE.md` for the wardrobe upload lifecycle.
See `docs/WARDROBE_ONBOARDING.md` for the current non-image wardrobe setup foundation.
