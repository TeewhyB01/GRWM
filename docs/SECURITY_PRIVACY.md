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

- Placeholder Firestore rules deny access until collections are explicitly modeled.
- Placeholder Storage rules deny access until image paths are explicitly modeled.
- Environment variables are documented but not committed with secrets.

## Future Work

- Consent versioning.
- Data deletion workflow.
- Audit logging for admin actions.
- Role-based access control for the admin dashboard.
- Privacy review before AI, avatar, shopping, or payment features.
