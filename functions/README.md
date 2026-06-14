# GRWM Firebase Functions

Firebase Cloud Functions package for GRWM.

Production functions should validate Firebase Authentication, sanitize inputs, avoid logging sensitive user data, and keep AI, avatar, payment, and shopping integrations behind explicit future design reviews.

`userDataDeletion` is the trusted backend deletion processor. It runs from `userDeletionRequests/{userId}` document creation, verifies the request belongs to that user, deletes user-owned Firestore records and private Storage files, deletes the Firebase Auth user when available, writes deletion audit logs, and retains a minimal request tombstone.

See `docs/USER_DATA_DELETION.md` for coverage, tests, known limitations, and production readiness checks.
