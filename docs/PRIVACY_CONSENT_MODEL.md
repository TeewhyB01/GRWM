# GRWM Privacy Consent Model

## Consent Version

Current foundation version: `2026-06-foundation`.

Consent choices are opt-in by default and stored in `privacyConsents`.

## Consent Purposes

- Wardrobe photo analysis
- Style photo analysis
- Avatar creation
- Location and weather use
- AI recommendation use
- Marketing emails
- Analytics

## Sensitive Data Classes

- Wardrobe photos and metadata
- Style photos
- Avatar source photos and generated assets
- Body-shape notes and fit preferences
- Location or country data used for weather styling
- User profile and subscription metadata

## Deletion Model

Users request deletion through `userDeletionRequests`. Direct user document deletion is denied in Firestore rules so deletion can be verified, audited, and processed by trusted backend code.

## Next Privacy Work

- Add Firebase emulator tests for consent and deletion rules.
- Add consent capture UI before image upload or recommendation features.
- Add a trusted deletion processor Cloud Function.
- Define retention windows for Storage files and audit logs.
