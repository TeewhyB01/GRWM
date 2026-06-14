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

## Future Work

- Consent versioning UI.
- Functions emulator integration tests for deletion triggers.
- Audit log review and support tooling for failed deletion requests.
- Role-based access control for the admin dashboard.
- Privacy review before AI, avatar, shopping, or payment features.

See `docs/USER_DATA_DELETION.md` for deletion coverage, audit events, emulator-safe tests, and production readiness checks.
