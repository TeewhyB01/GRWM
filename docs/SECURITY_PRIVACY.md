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
- Storage rules now allow access only under the authenticated user's own `users/{userId}` path.
- Environment variables are documented but not committed with secrets.
- Privacy consent starts from opt-in false for wardrobe photo analysis, style photo analysis, avatar creation, location/weather use, AI recommendations, marketing emails, and analytics.
- Account deletion requests are modeled so deletion can be verified and audited.
- Account/data deletion is processed by the trusted `userDataDeletion` Cloud Function trigger, not by direct client deletion.
- Deletion audit logs record lifecycle events and non-sensitive counts without wardrobe, avatar, or photo object names.
- Functions emulator integration verifies the deletion trigger deletes only the requesting user's data, preserves admin collections, writes audit logs, deletes private Storage files, deletes the Auth emulator user, and leaves unaffected users intact.

## Current Rule Limitations

- The first admin owner must be bootstrapped with trusted Admin SDK credentials.
- Admin custom claims are not implemented yet.
- Firestore rules allow users to create only their own `requested` deletion request and deny client-side deletion status updates. Full field validation for every sensitive collection remains future work.
- Storage rules do not yet enforce MIME type, file size, or moderation status.
- Additional production-like failure drills for Firestore or Storage outages are still needed before production data collection.
- `users/{uid}` is owner-writable for the foundation mobile signup flow. Before production, backend-owned account lifecycle fields such as `disabled`, `emailVerified`, and provider state should move behind trusted code or stricter rule validation.
- Admin web UI authentication is a placeholder and must not be connected to real operational data until Firebase Auth, role issuance, and owner bootstrap are implemented.

## Wardrobe Upload Security Blockers

- Define allowed image content types and maximum upload size in Storage rules.
- Require upload metadata that binds a Storage object to the authenticated user and intended wardrobe item.
- Add Firestore rule validation for `wardrobeItems.storagePath`, immutable `userId`, allowed category/visibility values, and timestamps.
- Add emulator tests for invalid content type, oversized upload, cross-user metadata mismatch, public read denial, and orphan cleanup behavior.
- Require wardrobe photo analysis consent before any backend analysis job is queued.

## Future Work

- Consent versioning UI.
- Audit log review and support tooling for failed deletion requests.
- Role-based access control for the admin dashboard.
- Privacy review before AI, avatar, shopping, or payment features.
- Storage moderation and malware/abuse scanning workflow before public launch.

See `docs/USER_DATA_DELETION.md` for deletion coverage, audit events, emulator-safe tests, and production readiness checks.
See `docs/ARCHITECTURE_REVIEW.md` for the latest architecture gate and wardrobe upload blockers.
