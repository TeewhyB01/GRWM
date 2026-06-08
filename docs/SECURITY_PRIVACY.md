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

## Current Rule Limitations

- The first admin owner must be bootstrapped with trusted Admin SDK credentials.
- Admin custom claims are not implemented yet.
- Firestore rules do not yet validate every field transition.
- Storage rules do not yet enforce MIME type, file size, or moderation status.
- Emulator rule tests are needed before production data collection.

## Future Work

- Firebase emulator test suite.
- Consent versioning UI.
- Data deletion processor.
- Audit logging for admin actions.
- Role-based access control for the admin dashboard.
- Privacy review before AI, avatar, shopping, or payment features.
