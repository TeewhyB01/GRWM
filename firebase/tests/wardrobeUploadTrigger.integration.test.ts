import assert from "node:assert/strict";
import { accessSync } from "node:fs";
import test, { after, before } from "node:test";

import { deleteApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type DocumentData, type Firestore } from "firebase-admin/firestore";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  MAX_WARDROBE_IMAGE_BYTES,
  PRIVACY_CONSENT_VERSION,
  buildWardrobeUploadMetadata,
  createDefaultPrivacyConsent,
  firestoreCollections,
  parseWardrobeUploadStoragePath,
  storagePaths,
  type PrivacyConsent,
  type WardrobeItem
} from "@grwm/shared";

import {
  wardrobeUploadFinalisation,
  wardrobeUploadTriggerBucket
} from "../../functions/src/wardrobeUpload/index.ts";
import { firestorePathBuilders } from "./helpers/paths.ts";
import { createSeedWardrobeItem, seedNowIso } from "./helpers/seedData.ts";
import { testEmails, testUserIds } from "./helpers/ids.ts";
import {
  authenticatedTestContext,
  cleanupRulesTestEnvironment,
  initializeRulesTestEnvironment
} from "./helpers/testEnvironment.ts";

type EmulatorHubResponse = Record<string, {
  host?: string;
  port?: number;
}>;

type WardrobeUploadEndpoint = {
  __endpoint?: {
    eventTrigger?: {
      eventFilters?: Record<string, string>;
      eventType?: string;
    };
    region?: string[];
  };
};

type WardrobeUploadFunction = WardrobeUploadEndpoint & {
  run(event: {
    data: {
      bucket: string;
      contentType?: string;
      metadata?: Record<string, string>;
      name?: string;
      size?: number | string;
    };
  }): Promise<unknown>;
};

interface UploadedStorageObject {
  contentType: string;
  customMetadata: Record<string, string>;
  sizeBytes: number;
  storagePath: string;
}

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "demo-grwm-functions";
const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`;
const testImageBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x47, 0x52, 0x57, 0x4d, 0xff, 0xd9]);

let app: App;
let auth: Auth;
let db: Firestore;
let testEnv: RulesTestEnvironment;

function parseHostAndPort(value: string, fallbackPort: number): {
  host: string;
  port: number;
} {
  const parsed = new URL(`http://${value || `127.0.0.1:${fallbackPort}`}`);

  return {
    host: parsed.hostname,
    port: Number(parsed.port)
  };
}

function requireEmulatorOnlyConfig(): void {
  assert.match(projectId, /^demo-/, "Wardrobe upload trigger tests must use a demo Firebase project ID.");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "FIREBASE_AUTH_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "FIRESTORE_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "FIREBASE_STORAGE_EMULATOR_HOST must be set.");
  assert.ok(process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST, "FIREBASE_FUNCTIONS_EMULATOR_HOST must be set.");
  assert.equal(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "", "", "Production credentials must not be used.");
}

function assertFunctionsBuildOutputExists(): void {
  accessSync("functions/lib/index.js");
}

async function assertFunctionsEmulatorIsRunning(): Promise<void> {
  const hubHost = process.env.FIREBASE_EMULATOR_HUB ?? "127.0.0.1:4420";
  const expectedFunctions = parseHostAndPort(process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST ?? "", 5005);
  const response = await fetch(`http://${hubHost}/emulators`);

  assert.equal(response.status, 200);

  const hub = await response.json() as EmulatorHubResponse;

  assert.equal(hub.functions?.host, expectedFunctions.host);
  assert.equal(hub.functions?.port, expectedFunctions.port);
}

function assertWardrobeTriggerEndpoint(): void {
  const endpoint = (wardrobeUploadFinalisation as WardrobeUploadFunction).__endpoint;

  assert.equal(wardrobeUploadTriggerBucket, storageBucketName);
  assert.equal(endpoint?.eventTrigger?.eventType, "google.cloud.storage.object.v1.finalized");
  assert.equal(endpoint?.eventTrigger?.eventFilters?.bucket, storageBucketName);
  assert.deepEqual(endpoint?.region, ["us-central1"]);
}

function assertWardrobePathGuard(): void {
  const wardrobePath = storagePaths.wardrobeOriginal(testUserIds.userA, "trigger-path-guard").path;

  assert.deepEqual(parseWardrobeUploadStoragePath(wardrobePath), {
    userId: testUserIds.userA,
    itemId: "trigger-path-guard"
  });
  assert.equal(parseWardrobeUploadStoragePath(storagePaths.stylePhotoOriginal(testUserIds.userA, "photo-1").path), null);
  assert.equal(parseWardrobeUploadStoragePath(storagePaths.avatarGenerated(testUserIds.userA, "avatar-1").path), null);
  assert.equal(parseWardrobeUploadStoragePath("users/local-user-a/outfits/outfit-1"), null);
  assert.equal(parseWardrobeUploadStoragePath("public/wardrobe/item-1/original"), null);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isFirebaseErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
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

async function createAuthUser(params: {
  email: string;
  userId: string;
}): Promise<void> {
  await deleteAuthUserIfExists(params.userId);
  await auth.createUser({
    uid: params.userId,
    email: params.email,
    password: "wardrobe-upload-trigger-password",
    emailVerified: true,
    disabled: false
  });
}

async function seedPrivacyConsent(params: {
  overrides?: Partial<PrivacyConsent>;
  userId: string;
}): Promise<void> {
  const consent = {
    ...createDefaultPrivacyConsent({
      id: params.userId,
      userId: params.userId,
      createdAtIso: seedNowIso
    }),
    ...params.overrides
  };

  await db.doc(firestorePathBuilders.privacyConsent(params.userId)).set(consent);
}

async function seedWardrobeItem(params: {
  itemId: string;
  overrides?: Partial<WardrobeItem>;
  userId: string;
}): Promise<void> {
  await db.doc(firestorePathBuilders.wardrobeItem(params.itemId)).set({
    ...createSeedWardrobeItem({
      id: params.itemId,
      userId: params.userId
    }),
    ...params.overrides
  });
}

async function wardrobeItemData(itemId: string): Promise<DocumentData | null> {
  const snapshot = await db.doc(firestorePathBuilders.wardrobeItem(itemId)).get();

  return snapshot.exists ? snapshot.data() ?? null : null;
}

async function uploadWardrobeObject(params: {
  bypassRules?: boolean;
  bytes?: Uint8Array;
  contentType?: string;
  itemId: string;
  metadataOverrides?: Record<string, string>;
  userId: string;
}): Promise<UploadedStorageObject> {
  const metadata = buildWardrobeUploadMetadata({
    consentVersion: PRIVACY_CONSENT_VERSION,
    itemId: params.itemId,
    userId: params.userId
  });
  const bytes = params.bytes ?? testImageBytes;
  const storageMetadata = {
    contentType: params.contentType ?? "image/jpeg",
    customMetadata: {
      ...metadata,
      ...params.metadataOverrides
    }
  };

  if (params.bypassRules === true) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await new Promise((resolve, reject) => {
        context.storage().ref(metadata.storagePath).put(bytes, storageMetadata).then(resolve, reject);
      });
    });
  } else {
    await new Promise((resolve, reject) => {
      authenticatedTestContext(testEnv, params.userId)
        .storage()
        .ref(metadata.storagePath)
        .put(bytes, storageMetadata)
        .then(resolve, reject);
    });
  }

  return {
    contentType: storageMetadata.contentType,
    customMetadata: storageMetadata.customMetadata,
    sizeBytes: bytes.byteLength,
    storagePath: metadata.storagePath
  };
}

async function uploadIgnoredObject(
  path: string,
  customMetadata: Record<string, string> = {}
): Promise<UploadedStorageObject> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await new Promise((resolve, reject) => {
      context.storage().ref(path).put(testImageBytes, {
        contentType: "image/jpeg",
        customMetadata
      }).then(resolve, reject);
    });
  });

  return {
    contentType: "image/jpeg",
    customMetadata,
    sizeBytes: testImageBytes.byteLength,
    storagePath: path
  };
}

async function runWardrobeStorageFinalized(object: UploadedStorageObject): Promise<void> {
  await (wardrobeUploadFinalisation as WardrobeUploadFunction).run({
    data: {
      bucket: storageBucketName,
      contentType: object.contentType,
      metadata: object.customMetadata,
      name: object.storagePath,
      size: String(object.sizeBytes)
    }
  });
}

async function waitForWardrobeItemStatus(params: {
  expectedStatus: WardrobeItem["uploadStatus"];
  itemId: string;
  timeoutMs?: number;
}): Promise<DocumentData> {
  const startedAt = Date.now();
  let lastData: DocumentData | null = null;

  while (Date.now() - startedAt < (params.timeoutMs ?? 30000)) {
    lastData = await wardrobeItemData(params.itemId);

    if (lastData?.uploadStatus === params.expectedStatus) {
      return lastData;
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for ${params.itemId} to become ${params.expectedStatus}. Last data: ${JSON.stringify(lastData)}`);
}

async function auditLogsForTarget(targetId: string): Promise<DocumentData[]> {
  const snapshot = await db.collection(firestoreCollections.adminAuditLogs)
    .where("targetId", "==", targetId)
    .get();

  return snapshot.docs.map((documentSnapshot) => documentSnapshot.data());
}

async function waitForAuditLog(params: {
  action: string;
  failureReason?: string;
  targetId: string;
  timeoutMs?: number;
}): Promise<DocumentData> {
  const startedAt = Date.now();
  let lastLogs: DocumentData[] = [];

  while (Date.now() - startedAt < (params.timeoutMs ?? 30000)) {
    lastLogs = await auditLogsForTarget(params.targetId);

    const matchingLog = lastLogs.find((auditLog) => {
      const metadata = typeof auditLog.metadata === "object" && auditLog.metadata !== null
        ? auditLog.metadata as Record<string, unknown>
        : {};

      return (
        auditLog.action === params.action &&
        (params.failureReason === undefined || metadata.failureReason === params.failureReason)
      );
    });

    if (matchingLog) {
      return matchingLog;
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for audit log ${params.action} on ${params.targetId}. Last logs: ${JSON.stringify(lastLogs)}`);
}

async function aiJobCountForUser(userId: string): Promise<number> {
  const snapshot = await db.collection("aiJobs")
    .where("userId", "==", userId)
    .get();

  return snapshot.size;
}

async function auditLogCount(): Promise<number> {
  return (await db.collection(firestoreCollections.adminAuditLogs).count().get()).data().count;
}

before(async () => {
  requireEmulatorOnlyConfig();
  assertFunctionsBuildOutputExists();
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIREBASE_PROJECT_ID = projectId;
  process.env.FIREBASE_STORAGE_BUCKET = storageBucketName;

  app = getApps()[0] ?? initializeApp({
    projectId,
    storageBucket: storageBucketName
  });
  auth = getAuth(app);
  db = getFirestore(app);
  testEnv = await initializeRulesTestEnvironment(["storage"]);

  await assertFunctionsEmulatorIsRunning();
});

after(async () => {
  if (testEnv) {
    await cleanupRulesTestEnvironment(testEnv);
  }

  if (app) {
    await deleteApp(app);
  }
});

test("wardrobeUploadFinalisation is registered as an emulator Storage finalize trigger", () => {
  assertWardrobeTriggerEndpoint();
  assertWardrobePathGuard();
});

test("valid wardrobe Storage finalize marks upload uploaded without creating AI work", async () => {
  const itemId = "trigger-valid-item";

  await createAuthUser({
    email: testEmails.userA,
    userId: testUserIds.userA
  });
  await seedPrivacyConsent({
    overrides: {
      wardrobePhotoAnalysis: true
    },
    userId: testUserIds.userA
  });
  await seedWardrobeItem({
    itemId,
    userId: testUserIds.userA
  });

  const storageObject = await uploadWardrobeObject({
    itemId,
    userId: testUserIds.userA
  });
  await runWardrobeStorageFinalized(storageObject);
  const uploadedItem = await waitForWardrobeItemStatus({
    expectedStatus: "uploaded",
    itemId
  });
  const auditLog = await waitForAuditLog({
    action: "wardrobe-upload.finalised",
    targetId: itemId
  });

  assert.equal(storageObject.storagePath, storagePaths.wardrobeOriginal(testUserIds.userA, itemId).path);
  assert.equal(uploadedItem.uploadFailureReason, "");
  assert.equal(uploadedItem.uploadFailedAtIso, "");
  assert.equal(typeof uploadedItem.uploadedAtIso, "string");
  assert.notEqual(uploadedItem.uploadedAtIso, "");
  assert.equal(uploadedItem.updatedAtIso, uploadedItem.uploadedAtIso);
  assert.equal(uploadedItem.analysisStatus, "not_requested");
  assert.notEqual(uploadedItem.analysisStatus, "completed");
  assert.equal(uploadedItem.analysisConsentVersion, "");
  assert.equal(auditLog.targetUserId, testUserIds.userA);
  assert.equal(JSON.stringify(auditLog).includes(storageObject.storagePath), false);
  assert.equal(await aiJobCountForUser(testUserIds.userA), 0);
});

test("missing wardrobePhotoAnalysis consent does not block private upload finalisation or create AI work", async () => {
  const userId = "trigger-no-analysis-consent-user";
  const itemId = "trigger-no-analysis-consent-item";

  await createAuthUser({
    email: "trigger-no-analysis-consent@example.test",
    userId
  });
  await seedPrivacyConsent({
    overrides: {
      wardrobePhotoAnalysis: false
    },
    userId
  });
  await seedWardrobeItem({
    itemId,
    userId
  });

  const storageObject = await uploadWardrobeObject({
    itemId,
    userId
  });
  await runWardrobeStorageFinalized(storageObject);

  const uploadedItem = await waitForWardrobeItemStatus({
    expectedStatus: "uploaded",
    itemId
  });

  assert.equal(uploadedItem.analysisStatus, "not_requested");
  assert.notEqual(uploadedItem.analysisStatus, "completed");
  assert.equal(await aiJobCountForUser(userId), 0);
});

test("metadata owner mismatch marks only the matching owner item failed with a safe reason", async () => {
  const itemId = "trigger-metadata-mismatch-item";
  const userBItemId = "trigger-metadata-mismatch-user-b-item";

  await createAuthUser({
    email: "trigger-metadata-mismatch-a@example.test",
    userId: "trigger-metadata-mismatch-user-a"
  });
  await createAuthUser({
    email: "trigger-metadata-mismatch-b@example.test",
    userId: "trigger-metadata-mismatch-user-b"
  });
  await seedWardrobeItem({
    itemId,
    userId: "trigger-metadata-mismatch-user-a"
  });
  await seedWardrobeItem({
    itemId: userBItemId,
    userId: "trigger-metadata-mismatch-user-b"
  });

  const storageObject = await uploadWardrobeObject({
    bypassRules: true,
    itemId,
    metadataOverrides: {
      ownerId: "trigger-metadata-mismatch-user-b"
    },
    userId: "trigger-metadata-mismatch-user-a"
  });
  await runWardrobeStorageFinalized(storageObject);
  const failedItem = await waitForWardrobeItemStatus({
    expectedStatus: "upload_failed",
    itemId
  });
  const userBItem = await wardrobeItemData(userBItemId);
  const auditLog = await waitForAuditLog({
    action: "wardrobe-upload.failed",
    failureReason: "metadata_mismatch",
    targetId: itemId
  });

  assert.equal(failedItem.uploadFailureReason, "metadata_mismatch");
  assert.doesNotMatch(String(failedItem.uploadFailureReason), /secret|credential|token|password|127\.0\.0\.1|localhost|users\//i);
  assert.equal(userBItem?.uploadStatus, "upload_pending");
  assert.equal(userBItem?.uploadFailureReason, "");
  assert.equal(JSON.stringify(auditLog).includes(storageObject.storagePath), false);
  assert.equal(await aiJobCountForUser("trigger-metadata-mismatch-user-a"), 0);
  assert.equal(await aiJobCountForUser("trigger-metadata-mismatch-user-b"), 0);
});

test("valid-looking wardrobe object without a matching record is audited without creating an item", async () => {
  const userId = "trigger-missing-record-user";
  const itemId = "trigger-missing-record-item";

  await createAuthUser({
    email: "trigger-missing-record@example.test",
    userId
  });

  const storageObject = await uploadWardrobeObject({
    itemId,
    userId
  });
  await runWardrobeStorageFinalized(storageObject);

  const auditLog = await waitForAuditLog({
    action: "wardrobe-upload.failed",
    failureReason: "missing_wardrobe_item",
    targetId: itemId
  });

  assert.equal(await wardrobeItemData(itemId), null);
  assert.equal(auditLog.targetUserId, userId);
  assert.equal(await aiJobCountForUser(userId), 0);
});

test("cross-user item ID collision is audited without touching the other user's wardrobe item", async () => {
  const pathUserId = "trigger-cross-user-path-user";
  const ownerUserId = "trigger-cross-user-owner";
  const itemId = "trigger-cross-user-collision-item";

  await createAuthUser({
    email: "trigger-cross-user-path@example.test",
    userId: pathUserId
  });
  await createAuthUser({
    email: "trigger-cross-user-owner@example.test",
    userId: ownerUserId
  });
  await seedWardrobeItem({
    itemId,
    userId: ownerUserId
  });

  const storageObject = await uploadWardrobeObject({
    itemId,
    userId: pathUserId
  });
  await runWardrobeStorageFinalized(storageObject);

  const auditLog = await waitForAuditLog({
    action: "wardrobe-upload.failed",
    failureReason: "user_mismatch",
    targetId: itemId
  });
  const ownerItem = await wardrobeItemData(itemId);

  assert.equal(ownerItem?.userId, ownerUserId);
  assert.equal(ownerItem?.ownerId, ownerUserId);
  assert.equal(ownerItem?.uploadStatus, "upload_pending");
  assert.equal(ownerItem?.uploadFailureReason, "");
  assert.equal(auditLog.targetUserId, pathUserId);
  assert.equal(await aiJobCountForUser(pathUserId), 0);
  assert.equal(await aiJobCountForUser(ownerUserId), 0);
});

test("admin-bypassed invalid content type and oversized wardrobe objects fail finalisation safely", async () => {
  const userId = "trigger-unsafe-object-user";
  const invalidContentTypeItemId = "trigger-invalid-content-type-item";
  const oversizedItemId = "trigger-oversized-item";

  await createAuthUser({
    email: "trigger-unsafe-object@example.test",
    userId
  });
  await seedWardrobeItem({
    itemId: invalidContentTypeItemId,
    userId
  });
  await seedWardrobeItem({
    itemId: oversizedItemId,
    userId
  });

  const invalidContentTypeObject = await uploadWardrobeObject({
    bypassRules: true,
    contentType: "application/pdf",
    itemId: invalidContentTypeItemId,
    userId
  });
  const oversizedObject = await uploadWardrobeObject({
    bypassRules: true,
    bytes: new Uint8Array(MAX_WARDROBE_IMAGE_BYTES + 1),
    itemId: oversizedItemId,
    userId
  });
  await runWardrobeStorageFinalized(invalidContentTypeObject);
  await runWardrobeStorageFinalized(oversizedObject);

  const invalidContentTypeItem = await waitForWardrobeItemStatus({
    expectedStatus: "upload_failed",
    itemId: invalidContentTypeItemId
  });
  const oversizedItem = await waitForWardrobeItemStatus({
    expectedStatus: "upload_failed",
    itemId: oversizedItemId
  });

  await waitForAuditLog({
    action: "wardrobe-upload.failed",
    failureReason: "invalid_content_type",
    targetId: invalidContentTypeItemId
  });
  await waitForAuditLog({
    action: "wardrobe-upload.failed",
    failureReason: "file_too_large",
    targetId: oversizedItemId
  });

  assert.equal(invalidContentTypeItem.uploadFailureReason, "invalid_content_type");
  assert.equal(oversizedItem.uploadFailureReason, "file_too_large");
  assert.equal(await aiJobCountForUser(userId), 0);
});

test("non-wardrobe Storage finalize paths are ignored without wardrobe side effects", async () => {
  const auditCountBefore = await auditLogCount();

  await runWardrobeStorageFinalized(await uploadIgnoredObject(
    storagePaths.stylePhotoOriginal(testUserIds.userA, "trigger-style-photo").path,
    {
      ownerId: testUserIds.userA,
      userId: testUserIds.userA,
      photoId: "trigger-style-photo",
      uploadCategory: "style-photo-original",
      consentVersion: PRIVACY_CONSENT_VERSION
    }
  ));
  await runWardrobeStorageFinalized(await uploadIgnoredObject(
    storagePaths.avatarGenerated(testUserIds.userA, "trigger-avatar-generated").path,
    {
      ownerId: testUserIds.userA,
      userId: testUserIds.userA,
      generationId: "trigger-avatar-generated",
      uploadCategory: "avatar-generated",
      consentVersion: PRIVACY_CONSENT_VERSION
    }
  ));
  await runWardrobeStorageFinalized(await uploadIgnoredObject("users/local-user-a/outfits/trigger-outfit"));
  await runWardrobeStorageFinalized(await uploadIgnoredObject("unrelated/trigger-object"));

  assert.equal(await auditLogCount(), auditCountBefore);
});

test("duplicate finalize leaves an uploaded wardrobe item stable", async () => {
  const userId = "trigger-idempotent-user";
  const itemId = "trigger-idempotent-item";

  await createAuthUser({
    email: "trigger-idempotent@example.test",
    userId
  });
  await seedWardrobeItem({
    itemId,
    userId
  });

  const initialStorageObject = await uploadWardrobeObject({
    itemId,
    userId
  });
  await runWardrobeStorageFinalized(initialStorageObject);

  const uploadedItem = await waitForWardrobeItemStatus({
    expectedStatus: "uploaded",
    itemId
  });
  const auditCountAfterFirstFinalize = (await auditLogsForTarget(itemId)).length;

  const replayedStorageObject = await uploadWardrobeObject({
    bypassRules: true,
    itemId,
    userId
  });
  await runWardrobeStorageFinalized(replayedStorageObject);

  const replayedItem = await wardrobeItemData(itemId);

  assert.equal(replayedItem?.uploadStatus, "uploaded");
  assert.equal(replayedItem?.uploadedAtIso, uploadedItem.uploadedAtIso);
  assert.equal(replayedItem?.uploadFailureReason, "");
  assert.equal((await auditLogsForTarget(itemId)).length, auditCountAfterFirstFinalize);
  assert.equal(await aiJobCountForUser(userId), 0);
});
