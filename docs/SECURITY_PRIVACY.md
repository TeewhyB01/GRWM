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
- Environment variables are documented but not committed with secrets.
- Privacy consent starts from opt-in false for wardrobe photo analysis, style photo analysis, avatar creation, location/weather use, AI recommendations, marketing emails, and analytics.
- Account deletion requests are modeled so deletion can be verified and audited.
- Account/data deletion is processed by the trusted `userDataDeletion` Cloud Function trigger, not by direct client deletion.
- Deletion audit logs record lifecycle events and non-sensitive counts without wardrobe, avatar, or photo object names.
- Functions emulator integration verifies the deletion trigger deletes only the requesting user's data, preserves admin collections, writes audit logs, deletes private Storage files, deletes the Auth emulator user, and leaves unaffected users intact.
- Shared consent gates now distinguish private wardrobe photo upload from wardrobe photo analysis, avatar creation, and location/weather use.

## Current Rule Limitations

- The first admin owner must be bootstrapped with trusted Admin SDK credentials.
- Admin custom claims are not implemented yet.
- Firestore rules allow users to create only their own `requested` deletion request and deny client-side deletion status updates. Full field validation for every sensitive collection remains future work.
- Storage rules enforce MIME type, size, and request metadata for allowed upload paths, but cannot verify bytes against MIME claims, check Firestore document existence, check the user's consent document, or run moderation/malware scanning.
- Additional production-like failure drills for Firestore or Storage outages are still needed before production data collection.
- `users/{uid}` is owner-writable for the foundation mobile signup flow. Before production, backend-owned account lifecycle fields such as `disabled`, `emailVerified`, and provider state should move behind trusted code or stricter rule validation.
- Admin web UI authentication is a placeholder and must not be connected to real operational data until Firebase Auth, role issuance, and owner bootstrap are implemented.

## Wardrobe Upload Security Blockers

- Define the final upload lifecycle: Firestore document first, Storage object first, or trusted backend coordinator.
- Wire consent checks at the future upload/request point before any analysis job is queued.
- Implement or operationally accept a server-side orphan cleanup process before production uploads.
- Rerun mobile manual emulator QA in an installed development build after upload-adjacent rules are integrated.
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
