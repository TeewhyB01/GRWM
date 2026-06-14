import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { firestorePathBuilders } from "./helpers/paths.ts";
import {
  createSeedDeletionRequest,
  createSeedPrivacyConsent,
  createSeedUserProfile,
  createSeedWardrobeItem,
  localSeedAdminUsers,
  localSeedUserDefinitions,
  localSeedUsers,
  sampleDeletionRequest,
  samplePrivacyConsent,
  sampleUserProfile,
  sampleWardrobeItem
} from "./helpers/seedData.ts";
import { testDocumentIds, testUserIds } from "./helpers/ids.ts";

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "demo-grwm";

process.env.GCLOUD_PROJECT = projectId;
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

function isFirebaseErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: string }).code === code
  );
}

if (getApps().length === 0) {
  initializeApp({ projectId });
}

const auth = getAuth();
const db = getFirestore();

for (const seedUser of Object.values(localSeedUserDefinitions)) {
  try {
    await auth.updateUser(seedUser.uid, {
      email: seedUser.email,
      displayName: seedUser.displayName,
      emailVerified: true,
      disabled: false
    });
  } catch (error) {
    if (!isFirebaseErrorCode(error, "auth/user-not-found")) {
      throw error;
    }

    await auth.createUser({
      uid: seedUser.uid,
      email: seedUser.email,
      password: seedUser.password,
      displayName: seedUser.displayName,
      emailVerified: true,
      disabled: false
    });
  }
}

const userBProfile = createSeedUserProfile({
  id: testDocumentIds.userProfileB,
  userId: testUserIds.userB,
  displayName: "Local User B"
});
const userBPrivacyConsent = createSeedPrivacyConsent({
  id: testDocumentIds.privacyConsentB,
  userId: testUserIds.userB
});
const userBWardrobeItem = createSeedWardrobeItem({
  id: testDocumentIds.wardrobeItemB,
  userId: testUserIds.userB
});
const userBDeletionRequest = createSeedDeletionRequest({
  id: testUserIds.userB,
  userId: testUserIds.userB
});

const batch = db.batch();

for (const seedUser of Object.values(localSeedUsers)) {
  batch.set(db.doc(firestorePathBuilders.user(seedUser.id)), seedUser);
}

batch.set(db.doc(firestorePathBuilders.userProfile(sampleUserProfile.id)), sampleUserProfile);
batch.set(db.doc(firestorePathBuilders.userProfile(userBProfile.id)), userBProfile);
batch.set(db.doc(firestorePathBuilders.privacyConsent(samplePrivacyConsent.id)), samplePrivacyConsent);
batch.set(db.doc(firestorePathBuilders.privacyConsent(userBPrivacyConsent.id)), userBPrivacyConsent);
batch.set(db.doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id)), sampleWardrobeItem);
batch.set(db.doc(firestorePathBuilders.wardrobeItem(userBWardrobeItem.id)), userBWardrobeItem);
batch.set(db.doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id)), sampleDeletionRequest);
batch.set(db.doc(firestorePathBuilders.userDeletionRequest(userBDeletionRequest.id)), userBDeletionRequest);
batch.set(db.doc(firestorePathBuilders.adminUser(localSeedAdminUsers.ownerAdmin.id)), localSeedAdminUsers.ownerAdmin);
batch.set(
  db.doc(firestorePathBuilders.adminUser(localSeedAdminUsers.moderatorAdmin.id)),
  localSeedAdminUsers.moderatorAdmin
);

await batch.commit();

process.stdout.write(
  [
    `Seeded local Firebase emulators for project ${projectId}.`,
    `Auth emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
    `Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`,
    "Users: local-user-a, local-user-b, local-admin-owner, local-admin-moderator"
  ].join("\n")
);
