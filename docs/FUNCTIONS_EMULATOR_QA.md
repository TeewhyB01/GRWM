# Functions Emulator QA

## Scope

This checklist verifies the trusted `userDataDeletion` Cloud Function inside Firebase emulators only. It uses synthetic Auth, Firestore, and Storage data for the demo project `demo-grwm-functions`; it does not require production Firebase credentials or touch production data.

## Build Functions

```bash
pnpm functions:build
```

The build emits `functions/lib/index.js`. The full trigger QA script also checks that this file exists before starting emulators, because the Firebase Functions emulator loads definitions from the compiled `functions` package entrypoint.

## Run The Trigger Test

```bash
pnpm test:functions-emulator
pnpm test:deletion-trigger
pnpm qa:deletion:functions-emulator
```

All three commands run the same full-emulator deletion trigger suite. The command starts Auth, Firestore, Storage, and Functions with `firebase/firebase.functions-test.json` on isolated local ports and the demo project `demo-grwm-functions`.

## Emulator Config

The trigger QA config uses:

- Authentication: `127.0.0.1:9105`
- Cloud Firestore: `127.0.0.1:8095`
- Cloud Functions: `127.0.0.1:5005`
- Firebase Storage: `127.0.0.1:9197`
- Emulator hub: `127.0.0.1:4420`
- Logging: `127.0.0.1:4515`

The test asserts emulator host variables are set, the project ID starts with `demo-`, and `GOOGLE_APPLICATION_CREDENTIALS` is not set.

## Covered

- Functions build output exists before emulator startup.
- Firebase emulators load function definitions from `functions/lib/index.js`.
- `userDataDeletion` is registered by the Functions emulator as a Firestore function.
- Creating `userDeletionRequests/{userId}` with `status: requested` invokes the trigger.
- User-owned Firestore documents are deleted from `users`, `userProfiles`, `privacyConsents`, `styleProfiles`, `avatarProfiles`, `subscriptions`, `wardrobeItems`, and `outfitRecommendations`.
- User-owned Storage files under `users/{userId}/wardrobe/` are deleted.
- The Auth emulator user is deleted.
- `adminAuditLogs` receives deletion lifecycle audit entries without private Storage object names.
- `userDeletionRequests/{userId}` remains as a completed tombstone.
- An unaffected user's Firestore, Storage, and Auth records survive.
- Admin sentinel documents in `adminUsers` and `adminAuditLogs` survive.
- A controlled Auth deletion failure moves the request to `failed`, writes a safe failure reason, and records a failure audit log.
- Idempotency is covered for duplicate completed writes, completed request observations, and processing request observations.

## Not Covered

- Production Firebase project credentials, production Storage buckets, deployed Functions, or production data.
- Legal retention rules for future payment/provider records.
- Real mobile client deletion after Auth removal; mobile manual QA already covers request creation only.
- A forced Firestore emulator outage or Storage emulator outage during deletion. The failure-path test uses an invalid Auth UID to force the Auth deletion step to fail safely.

## Java 21 Warning

The current Firebase CLI run emits:

```text
firebase-tools will drop support for Java version < 21 soon in firebase-tools@15
```

This warning did not block the current emulator trigger test. Upgrade the local JDK to Java 21 before moving to Firebase Tools 15 or before relying on this QA workflow in CI.

## Production Readiness Checklist

- Keep `pnpm functions:build` green and confirm `functions/lib/index.js` is generated.
- Keep `pnpm test:functions-emulator` green before enabling deletion processing for real users.
- Verify deployed Functions use the intended production project ID, region, and Storage bucket.
- Confirm production service account credentials are available only to trusted backend runtimes.
- Confirm support procedures for `failed` deletion requests and audit log review.
- Confirm future payment, shopping, AI, and avatar records have explicit deletion or retention policies before those features ship.
- Re-run mobile A-G manual QA in an installed development build after auth/privacy/rules changes.
