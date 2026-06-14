import assert from "node:assert/strict";
import test, { after, before } from "node:test";

import { deleteApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firestoreCollections, type UserDeletionRequest } from "@grwm/shared";

import { firestorePathBuilders } from "./helpers/paths.ts";
import {
  createSeedAdminAuditLog,
  createSeedAdminUser,
  createSeedAvatarProfile,
  createSeedDeletionRequest,
  createSeedOutfitRecommendation,
  createSeedPrivacyConsent,
  createSeedStorageFile,
  createSeedStyleProfile,
  createSeedUserProfile,
  createSeedUserRecord,
  createSeedWardrobeItem,
  localSeedUserDefinitions,
  seedNowIso
} from "./helpers/seedData.ts";
import { testDocumentIds, testEmails, testUserIds } from "./helpers/ids.ts";

type StorageBucket = ReturnType<ReturnType<typeof getStorage>["bucket"]>;

interface SeededDeletionSubject {
  createAuthUser?: boolean;
  displayName: string;
  email: string;
  outfitRecommendationId: string;
  password: string;
  storageFilePath: string;
  userId: string;
  wardrobeItemId: string;
}

const expectedCompletedAuditActions = [
  "user-deletion.requested",
  "user-deletion.processing-started",
  "user-deletion.firestore-completed",
  "user-deletion.storage-completed",
  "user-deletion.auth-completed",
  "user-deletion.completed"
] as const;

const safeFailureReason = "Deletion processor failed before completion.";
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "demo-grwm-functions";
const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`;

let app: App;
let auth: Auth;
let bucket: StorageBucket;
let db: Firestore;

function requireEmulatorOnlyConfig(): void {
  assert.match(projectId, /^demo-/, "Deletion trigger tests must use a demo Firebase project ID.");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "FIREBASE_AUTH_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "FIRESTORE_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "FIREBASE_STORAGE_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST, "FIREBASE_FUNCTIONS_EMULATOR_HOST must be set.");
  assert.equal(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "", "", "Production credentials must not be used.");
}

function asDocumentData<T extends object>(data: T): Record<string, unknown> {
  return data as Record<string, unknown>;
}

function isFirebaseErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: unknown }).code === code
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function deletionRequestPath(userId: string): string {
  return firestorePathBuilders.userDeletionRequest(userId);
}

function createSubscriptionDocument(userId: string): Record<string, unknown> {
  return {
    id: userId,
    userId,
    planId: "free",
    status: "local-test",
    updatedAtIso: seedNowIso
  };
}

function createSubject(params: {
  displayName: string;
  email: string;
  outfitRecommendationId: string;
  password?: string;
  userId: string;
  wardrobeItemId: string;
  createAuthUser?: boolean;
}): SeededDeletionSubject {
  const storageFile = createSeedStorageFile({
    itemId: params.wardrobeItemId,
    userId: params.userId
  });

  return {
    createAuthUser: params.createAuthUser ?? true,
    displayName: params.displayName,
    email: params.email,
    outfitRecommendationId: params.outfitRecommendationId,
    password: params.password ?? "local-deletion-trigger-password",
    storageFilePath: storageFile.path,
    userId: params.userId,
    wardrobeItemId: params.wardrobeItemId
  };
}

async function deleteAuthUserIfExists(userId: string): Promise<void> {
  try {
    await auth.deleteUser(userId);
  } catch (error) {
    if (!isFirebaseErrorCode(error, "auth/user-not-found")) {
      throw error;
    }
  }
}

async function seedAuthUser(subject: SeededDeletionSubject): Promise<void> {
  if (subject.createAuthUser === false) {
    return;
  }

  await deleteAuthUserIfExists(subject.userId);
  await auth.createUser({
    uid: subject.userId,
    email: subject.email,
    password: subject.password,
    displayName: subject.displayName,
    emailVerified: true,
    disabled: false
  });
}

async function seedStorageFile(subject: SeededDeletionSubject): Promise<void> {
  const storageFile = createSeedStorageFile({
    itemId: subject.wardrobeItemId,
    userId: subject.userId
  });

  await bucket.file(storageFile.path).save(Buffer.from(storageFile.bytes), {
    metadata: {
      contentType: storageFile.contentType,
      metadata: storageFile.customMetadata
    }
  });
}

async function seedUserOwnedData(subject: SeededDeletionSubject): Promise<void> {
  await seedAuthUser(subject);

  const seedDefinition = {
    uid: subject.userId,
    email: subject.email,
    displayName: subject.displayName,
    password: subject.password
  };
  const batch = db.batch();

  batch.set(db.doc(firestorePathBuilders.user(subject.userId)), createSeedUserRecord(seedDefinition));
  batch.set(
    db.doc(firestorePathBuilders.userProfile(subject.userId)),
    createSeedUserProfile({
      id: subject.userId,
      userId: subject.userId,
      displayName: subject.displayName
    })
  );
  batch.set(
    db.doc(firestorePathBuilders.privacyConsent(subject.userId)),
    createSeedPrivacyConsent({
      id: subject.userId,
      userId: subject.userId
    })
  );
  batch.set(db.doc(firestorePathBuilders.styleProfile(subject.userId)), createSeedStyleProfile({
    userId: subject.userId
  }));
  batch.set(db.doc(firestorePathBuilders.avatarProfile(subject.userId)), createSeedAvatarProfile({
    userId: subject.userId
  }));
  batch.set(db.doc(firestorePathBuilders.subscription(subject.userId)), createSubscriptionDocument(subject.userId));
  batch.set(
    db.doc(firestorePathBuilders.wardrobeItem(subject.wardrobeItemId)),
    createSeedWardrobeItem({
      id: subject.wardrobeItemId,
      userId: subject.userId
    })
  );
  batch.set(
    db.doc(firestorePathBuilders.outfitRecommendation(subject.outfitRecommendationId)),
    createSeedOutfitRecommendation({
      id: subject.outfitRecommendationId,
      userId: subject.userId
    })
  );

  await batch.commit();
  await seedStorageFile(subject);
}

async function seedAdminSentinels(): Promise<void> {
  await db.doc(firestorePathBuilders.adminUser(testUserIds.ownerAdmin)).set(asDocumentData(createSeedAdminUser({
    email: testEmails.ownerAdmin,
    roles: ["owner"],
    userId: testUserIds.ownerAdmin
  })));
  await db.doc(firestorePathBuilders.adminAuditLog(testDocumentIds.adminAuditLogDeletionTrigger)).set({
    ...asDocumentData(createSeedAdminAuditLog()),
    id: testDocumentIds.adminAuditLogDeletionTrigger,
    targetId: testUserIds.unaffectedUser
  });
}

async function createDeletionRequest(userId: string): Promise<void> {
  await db.doc(deletionRequestPath(userId)).set(asDocumentData(createSeedDeletionRequest({
    id: userId,
    userId
  })));
}

async function waitForDeletionRequestStatus(
  userId: string,
  expectedStatus: UserDeletionRequest["status"]
): Promise<UserDeletionRequest> {
  const startedAt = Date.now();
  let lastData: Partial<UserDeletionRequest> | null = null;

  while (Date.now() - startedAt < 30000) {
    const snapshot = await db.doc(deletionRequestPath(userId)).get();
    lastData = snapshot.exists ? snapshot.data() as Partial<UserDeletionRequest> : null;

    if (lastData?.status === expectedStatus) {
      return lastData as UserDeletionRequest;
    }

    if (lastData?.status === "failed" && expectedStatus !== "failed") {
      throw new Error(`Deletion request failed while waiting for ${expectedStatus}: ${lastData.failureReason}`);
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for ${userId} deletion status ${expectedStatus}. Last data: ${JSON.stringify(lastData)}`);
}

async function documentExists(path: string): Promise<boolean> {
  return (await db.doc(path).get()).exists;
}

async function storageFileExists(path: string): Promise<boolean> {
  const [exists] = await bucket.file(path).exists();

  return exists;
}

async function authUserExists(userId: string): Promise<boolean> {
  try {
    await auth.getUser(userId);

    return true;
  } catch (error) {
    if (isFirebaseErrorCode(error, "auth/user-not-found")) {
      return false;
    }

    throw error;
  }
}

async function auditLogsForUser(userId: string): Promise<Record<string, unknown>[]> {
  const snapshot = await db.collection(firestoreCollections.adminAuditLogs)
    .where("targetUserId", "==", userId)
    .get();

  return snapshot.docs.map((documentSnapshot) => documentSnapshot.data());
}

async function assertUserOwnedFirestoreDeleted(subject: SeededDeletionSubject): Promise<void> {
  assert.equal(await documentExists(firestorePathBuilders.user(subject.userId)), false);
  assert.equal(await documentExists(firestorePathBuilders.userProfile(subject.userId)), false);
  assert.equal(await documentExists(firestorePathBuilders.privacyConsent(subject.userId)), false);
  assert.equal(await documentExists(firestorePathBuilders.styleProfile(subject.userId)), false);
  assert.equal(await documentExists(firestorePathBuilders.avatarProfile(subject.userId)), false);
  assert.equal(await documentExists(firestorePathBuilders.subscription(subject.userId)), false);
  assert.equal(
    (await db.collection(firestoreCollections.wardrobeItems).where("userId", "==", subject.userId).get()).empty,
    true
  );
  assert.equal(
    (await db.collection(firestoreCollections.outfitRecommendations).where("userId", "==", subject.userId).get()).empty,
    true
  );
}

async function assertUserOwnedDataStillExists(subject: SeededDeletionSubject): Promise<void> {
  assert.equal(await documentExists(firestorePathBuilders.user(subject.userId)), true);
  assert.equal(await documentExists(firestorePathBuilders.userProfile(subject.userId)), true);
  assert.equal(await documentExists(firestorePathBuilders.privacyConsent(subject.userId)), true);
  assert.equal(await documentExists(firestorePathBuilders.styleProfile(subject.userId)), true);
  assert.equal(await documentExists(firestorePathBuilders.avatarProfile(subject.userId)), true);
  assert.equal(await documentExists(firestorePathBuilders.wardrobeItem(subject.wardrobeItemId)), true);
  assert.equal(await documentExists(firestorePathBuilders.outfitRecommendation(subject.outfitRecommendationId)), true);
  assert.equal(await storageFileExists(subject.storageFilePath), true);
  assert.equal(await authUserExists(subject.userId), subject.createAuthUser !== false);
}

async function assertAdminSentinelsStillExist(): Promise<void> {
  assert.equal(await documentExists(firestorePathBuilders.adminUser(testUserIds.ownerAdmin)), true);
  assert.equal(await documentExists(firestorePathBuilders.adminAuditLog(testDocumentIds.adminAuditLogDeletionTrigger)), true);
}

before(() => {
  requireEmulatorOnlyConfig();
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIREBASE_PROJECT_ID = projectId;
  process.env.FIREBASE_STORAGE_BUCKET = storageBucketName;

  app = getApps()[0] ?? initializeApp({
    projectId,
    storageBucket: storageBucketName
  });
  auth = getAuth(app);
  db = getFirestore(app);
  bucket = getStorage(app).bucket(storageBucketName);
});

after(async () => {
  if (app) {
    await deleteApp(app);
  }
});

test("userDataDeletion trigger completes Firestore, Storage, Auth, and audit deletion in emulators", async () => {
  const deletionSubject = createSubject({
    displayName: localSeedUserDefinitions.deletionTestUser.displayName,
    email: localSeedUserDefinitions.deletionTestUser.email,
    outfitRecommendationId: testDocumentIds.outfitRecommendationDeletionTestUser,
    password: localSeedUserDefinitions.deletionTestUser.password,
    userId: testUserIds.deletionTestUser,
    wardrobeItemId: testDocumentIds.wardrobeItemDeletionTestUser
  });
  const unaffectedSubject = createSubject({
    displayName: localSeedUserDefinitions.unaffectedUser.displayName,
    email: localSeedUserDefinitions.unaffectedUser.email,
    outfitRecommendationId: testDocumentIds.outfitRecommendationUnaffectedUser,
    password: localSeedUserDefinitions.unaffectedUser.password,
    userId: testUserIds.unaffectedUser,
    wardrobeItemId: testDocumentIds.wardrobeItemUnaffectedUser
  });

  await seedUserOwnedData(deletionSubject);
  await seedUserOwnedData(unaffectedSubject);
  await seedAdminSentinels();
  await createDeletionRequest(deletionSubject.userId);

  const completedRequest = await waitForDeletionRequestStatus(deletionSubject.userId, "completed");
  const auditLogs = await auditLogsForUser(deletionSubject.userId);

  assert.equal(completedRequest.status, "completed");
  assert.equal(completedRequest.failureReason, "");
  assert.ok(completedRequest.completedAtIso);
  assert.ok(completedRequest.auditLogId);
  await assertUserOwnedFirestoreDeleted(deletionSubject);
  assert.equal(await storageFileExists(deletionSubject.storageFilePath), false);
  assert.equal(await authUserExists(deletionSubject.userId), false);
  await assertUserOwnedDataStillExists(unaffectedSubject);
  await assertAdminSentinelsStillExist();
  assert.deepEqual(
    expectedCompletedAuditActions.every((action) => auditLogs.some((auditLog) => auditLog.action === action)),
    true
  );
  assert.equal(
    auditLogs.some((auditLog) => JSON.stringify(auditLog).includes(deletionSubject.storageFilePath)),
    false
  );
});

test("userDataDeletion trigger marks a safe failure when the Auth deletion step fails", async () => {
  const authFailureUserId = `auth-delete-failure-${"x".repeat(130)}`;
  const failureSubject = createSubject({
    createAuthUser: false,
    displayName: "Auth Failure User",
    email: "auth-failure-user@example.test",
    outfitRecommendationId: "outfit-recommendation-auth-failure-user",
    userId: authFailureUserId,
    wardrobeItemId: "wardrobe-auth-failure-user"
  });
  const unaffectedSubject = createSubject({
    displayName: "Failure Path Unaffected User",
    email: "failure-path-unaffected@example.test",
    outfitRecommendationId: "outfit-recommendation-failure-unaffected",
    userId: "failure-path-unaffected-user",
    wardrobeItemId: "wardrobe-failure-unaffected"
  });

  await seedUserOwnedData(failureSubject);
  await seedUserOwnedData(unaffectedSubject);
  await createDeletionRequest(failureSubject.userId);

  const failedRequest = await waitForDeletionRequestStatus(failureSubject.userId, "failed");
  const auditLogs = await auditLogsForUser(failureSubject.userId);
  const failureAuditLog = auditLogs.find((auditLog) => auditLog.action === "user-deletion.failed");

  assert.equal(failedRequest.status, "failed");
  assert.equal(failedRequest.failureReason, safeFailureReason);
  assert.doesNotMatch(failedRequest.failureReason, /secret|credential|token|password|127\.0\.0\.1|localhost/i);
  assert.ok(failedRequest.failedAtIso);
  assert.ok(failureAuditLog);
  assert.equal(JSON.stringify(failureAuditLog).includes("auth-failure-user@example.test"), false);
  await assertUserOwnedDataStillExists(unaffectedSubject);
});

test("userDataDeletion trigger remains idempotent for duplicate writes and non-requested requests", async () => {
  const idempotentSubject = createSubject({
    displayName: "Idempotent Deletion User",
    email: "idempotent-deletion-user@example.test",
    outfitRecommendationId: "outfit-recommendation-idempotent-user",
    userId: "idempotent-deletion-user",
    wardrobeItemId: "wardrobe-idempotent-user"
  });
  const completedReplaySubject = createSubject({
    displayName: "Completed Replay User",
    email: "completed-replay-user@example.test",
    outfitRecommendationId: "outfit-recommendation-completed-replay",
    userId: "completed-replay-user",
    wardrobeItemId: "wardrobe-completed-replay"
  });
  const processingReplaySubject = createSubject({
    displayName: "Processing Replay User",
    email: "processing-replay-user@example.test",
    outfitRecommendationId: "outfit-recommendation-processing-replay",
    userId: "processing-replay-user",
    wardrobeItemId: "wardrobe-processing-replay"
  });

  await seedUserOwnedData(idempotentSubject);
  await createDeletionRequest(idempotentSubject.userId);

  const completedRequest = await waitForDeletionRequestStatus(idempotentSubject.userId, "completed");
  const auditLogCountAfterCompletion = (await auditLogsForUser(idempotentSubject.userId)).length;

  await db.doc(deletionRequestPath(idempotentSubject.userId)).set(asDocumentData(completedRequest), { merge: true });
  await sleep(1500);

  assert.equal((await auditLogsForUser(idempotentSubject.userId)).length, auditLogCountAfterCompletion);
  assert.equal(await authUserExists(idempotentSubject.userId), false);
  assert.equal(await storageFileExists(idempotentSubject.storageFilePath), false);

  await seedUserOwnedData(completedReplaySubject);
  await db.doc(deletionRequestPath(completedReplaySubject.userId)).set({
    ...asDocumentData(createSeedDeletionRequest({
      id: completedReplaySubject.userId,
      userId: completedReplaySubject.userId
    })),
    completedAtIso: seedNowIso,
    status: "completed"
  });
  await sleep(1500);

  assert.equal((await auditLogsForUser(completedReplaySubject.userId)).length, 0);
  await assertUserOwnedDataStillExists(completedReplaySubject);

  await seedUserOwnedData(processingReplaySubject);
  await db.doc(deletionRequestPath(processingReplaySubject.userId)).set({
    ...asDocumentData(createSeedDeletionRequest({
      id: processingReplaySubject.userId,
      userId: processingReplaySubject.userId
    })),
    processingStartedAtIso: seedNowIso,
    status: "processing"
  });
  await sleep(1500);

  assert.equal((await auditLogsForUser(processingReplaySubject.userId)).length, 0);
  await assertUserOwnedDataStillExists(processingReplaySubject);
});
