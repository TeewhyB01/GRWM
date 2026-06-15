# GRWM Privacy Consent Model

## Consent Version

Current foundation version: `2026-06-foundation`.

Consent choices are opt-in by default and stored in `privacyConsents/{userId}` with `source: mobile`, `createdAtIso`, and `updatedAtIso`.

## Consent Purposes

- Wardrobe photo analysis
- Style photo analysis
- Avatar creation
- Location and weather use
- AI recommendation use
- Marketing emails
- Analytics

Feature-specific consent choices must be accepted before the related feature uses that data:

- Wardrobe photo analysis gates wardrobe photo analysis.
- Style photo analysis gates style photo analysis.
- Avatar creation gates future avatar workflows.
- Location and weather use gates weather-aware styling.
- AI recommendation use gates future recommendation generation.

Marketing emails and analytics are optional controls and can remain off without blocking app access.

Private wardrobe image upload and wardrobe photo analysis are separate decisions. A recorded privacy consent document is required before creating a wardrobe upload draft, but `wardrobePhotoAnalysis: true` is required before any future analysis job can be requested. Missing analysis consent returns `blocked_missing_consent`; upload finalisation does not call AI providers.

## Mobile Capture Flow

After email/password signup, the protected privacy screen shows all consent purposes. The user can opt in or leave choices off, then the mobile client writes `privacyConsents/{userId}` using consent version `2026-06-foundation` and `source: mobile`.

The Settings screen reads the same document, shows current on/off status, and lets the user update consent choices. Future feature screens must check the relevant consent before collecting photos, location/weather context, avatar inputs, or AI recommendation data.

## Sensitive Data Classes

- Wardrobe photos and metadata
- Style photos
- Avatar source photos and generated assets
- Body-shape notes and fit preferences
- Location or country data used for weather styling
- User profile and subscription metadata

## Deletion Model

Users request deletion through `userDeletionRequests`. Direct user document deletion is denied in Firestore rules so deletion can be verified, audited, and processed by trusted backend code.

The mobile Settings screen creates `userDeletionRequests/{userId}` with `status: requested`; it does not delete Firestore or Storage data from the client.

The trusted backend `userDataDeletion` trigger verifies the request, deletes user-owned Firestore records, deletes private user-scoped Storage files, deletes the Firebase Auth user where available, writes admin audit logs, and retains a minimal deletion request tombstone.

## Next Privacy Work

- Rerun manual emulator testing for signup, consent capture, consent updates, logout, and deletion request creation in an EAS development build after auth, privacy, navigation, or rules changes.
- Add Functions emulator trigger tests for future backend consent recording if that placeholder becomes active.
- Define retention windows for Storage files and audit logs.
