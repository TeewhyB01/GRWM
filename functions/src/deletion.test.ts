import assert from "node:assert/strict";
import test from "node:test";

import type { Firestore } from "firebase-admin/firestore";

import {
  createCompletedDeletionTombstone,
  createDeletionAuditLogPayload,
  createFailureStatusUpdate,
  createProcessingStatusUpdate,
  deleteAuthUser,
  deletionAuditActions,
  getUserFirestoreDeletionPlan,
  getUserStorageDeletionPrefixes,
  processUserDeletionRequest,
  retainedDeletionCollections,
  type DeletionAuditLogPayload,
  type StorageBucketLike
} from "./deletion/index.ts";

const testNowIso = "2026-06-14T12:00:00.000Z";

function createRequestedDeletionRequest(userId: string) {
  return {
    id: userId,
    userId,
    requestedAtIso: testNowIso,
    status: "requested",
    processingStartedAtIso: "",
    completedAtIso: "",
    failedAtIso: "",
    failureReason: "",
    requestedBy: "user",
    source: "mobile",
    consentVersionAtRequest: "2026-06-foundation",
    auditLogId: ""
  } as const;
}

function createFakeFirestore(queryPathsByCollection: Record<string, readonly string[]> = {}) {
  const auditLogs: unknown[] = [];
  const deletedPaths: string[] = [];
  const documentSets: {
    data: unknown;
    path: string;
  }[] = [];
  let auditIndex = 0;

  const db = {
    batch() {
      const batchDeletedPaths: string[] = [];

      return {
        delete(documentReference: { path: string }) {
          batchDeletedPaths.push(documentReference.path);
        },
        async commit() {
          deletedPaths.push(...batchDeletedPaths);
        }
      };
    },
    collection(collectionName: string) {
      return {
        doc() {
          auditIndex += 1;
          const id = `audit_${auditIndex}`;
          const path = `${collectionName}/${id}`;

          return {
            id,
            path,
            async set(data: unknown) {
              auditLogs.push(data);
              documentSets.push({ data, path });
            }
          };
        },
        where(field: string, operator: string, value: string) {
          assert.equal(field, "userId");
          assert.equal(operator, "==");
          assert.equal(value, "user_1");

          return {
            async get() {
              return {
                docs: (queryPathsByCollection[collectionName] ?? []).map((path) => ({
                  ref: { path }
                }))
              };
            }
          };
        }
      };
    },
    doc(path: string) {
      return {
        path,
        async set(data: unknown) {
          documentSets.push({ data, path });
        }
      };
    }
  };

  return {
    auditLogs,
    db: db as unknown as Firestore,
    deletedPaths,
    documentSets
  };
}

function createFakeStorageBucket() {
  const deletedFiles: string[] = [];
  const queriedPrefixes: string[] = [];

  const bucket: StorageBucketLike = {
    async getFiles({ prefix }) {
      queriedPrefixes.push(prefix);

      if (!prefix.endsWith("/wardrobe/")) {
        return [[]];
      }

      return [
        [
          {
            name: `${prefix}item_a/original`,
            async delete() {
              deletedFiles.push(`${prefix}item_a/original`);
            }
          }
        ]
      ];
    }
  };

  return {
    bucket,
    deletedFiles,
    queriedPrefixes
  };
}

test("deletion request status helpers create auditable lifecycle updates", () => {
  const request = createRequestedDeletionRequest("user_1");
  const processingUpdate = createProcessingStatusUpdate({
    auditLogId: "audit_1",
    nowIso: "2026-06-14T12:01:00.000Z"
  });
  const completedTombstone = createCompletedDeletionTombstone({
    auditLogId: "audit_1",
    completedAtIso: "2026-06-14T12:02:00.000Z",
    request: {
      ...request,
      processingStartedAtIso: "2026-06-14T12:01:00.000Z"
    }
  });
  const failureUpdate = createFailureStatusUpdate({
    auditLogId: "audit_2",
    failureReason: "Deletion processor failed before completion.",
    nowIso: "2026-06-14T12:03:00.000Z"
  });

  assert.equal(processingUpdate.status, "processing");
  assert.equal(processingUpdate.failureReason, "");
  assert.equal(completedTombstone.status, "completed");
  assert.equal(completedTombstone.userId, "user_1");
  assert.equal(completedTombstone.failureReason, "");
  assert.equal(failureUpdate.status, "failed");
  assert.equal(failureUpdate.failureReason, "Deletion processor failed before completion.");
});

test("Firestore deletion plan selects user-owned data and excludes admin collections", () => {
  const plan = getUserFirestoreDeletionPlan("user_1");

  assert.ok(plan.ownerDocumentPaths.includes("users/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("userProfiles/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("privacyConsents/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("wardrobeSetupProfiles/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("styleProfiles/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("avatarProfiles/user_1"));
  assert.ok(plan.ownerDocumentPaths.includes("subscriptions/user_1"));
  assert.ok(plan.queryByUserIdCollections.includes("wardrobeItems"));
  assert.ok(plan.queryByUserIdCollections.includes("outfitRecommendations"));
  assert.ok(plan.queryByUserIdCollections.includes("savedOutfits"));
  assert.ok(plan.queryByUserIdCollections.includes("aiUsageLogs"));
  assert.equal(plan.ownerDocumentPaths.some((path) => path.startsWith("adminAuditLogs/")), false);
  assert.equal(plan.ownerDocumentPaths.some((path) => path.startsWith("adminUsers/")), false);
  assert.equal(plan.ownerDocumentPaths.some((path) => path.startsWith("userDeletionRequests/")), false);
  assert.deepEqual(retainedDeletionCollections, [
    "userDeletionRequests",
    "adminUsers",
    "adminAuditLogs"
  ]);
});

test("Storage deletion prefixes cover current private user file areas", () => {
  assert.deepEqual(getUserStorageDeletionPrefixes("user_1"), [
    "users/user_1/wardrobe/",
    "users/user_1/style-photos/",
    "users/user_1/avatar/source/",
    "users/user_1/avatar/generated/",
    "users/user_1/outfits/"
  ]);
});

test("audit log payload avoids private storage object names", () => {
  const auditLog = createDeletionAuditLogPayload({
    action: deletionAuditActions.storageCompleted,
    createdAtIso: testNowIso,
    id: "audit_1",
    metadata: {
      deletedStorageFileCount: 2
    },
    requestStatus: "processing",
    userId: "user_1"
  });

  assert.equal(auditLog.actorType, "system");
  assert.equal(auditLog.source, "function");
  assert.equal(auditLog.targetCollection, "userDeletionRequests");
  assert.deepEqual(Object.keys(auditLog.metadata), ["deletedStorageFileCount"]);
  assert.equal(JSON.stringify(auditLog).includes("item_a/original"), false);
});

test("Auth deletion treats missing users as already removed", async () => {
  const result = await deleteAuthUser({
    async deleteUser() {
      throw {
        code: "auth/user-not-found"
      };
    }
  }, "user_1");

  assert.deepEqual(result, {
    deleted: false,
    userId: "user_1"
  });
});

test("processor completes deletion lifecycle using helper dependencies", async () => {
  const firestore = createFakeFirestore({
    wardrobeItems: ["wardrobeItems/item_1"],
    outfitRecommendations: ["outfitRecommendations/rec_1"]
  });
  const storage = createFakeStorageBucket();
  const nowValues = [
    "2026-06-14T12:00:01.000Z",
    "2026-06-14T12:00:02.000Z",
    "2026-06-14T12:00:03.000Z",
    "2026-06-14T12:00:04.000Z",
    "2026-06-14T12:00:05.000Z",
    "2026-06-14T12:00:06.000Z",
    "2026-06-14T12:00:07.000Z"
  ];
  const deletedAuthUsers: string[] = [];

  const outcome = await processUserDeletionRequest({
    deps: {
      auth: {
        async deleteUser(userId: string) {
          deletedAuthUsers.push(userId);
        }
      },
      bucket: storage.bucket,
      db: firestore.db,
      logger: console,
      nowIso: () => nowValues.shift() ?? "2026-06-14T12:00:08.000Z"
    },
    requestData: createRequestedDeletionRequest("user_1"),
    requestId: "user_1"
  });

  assert.equal(outcome.ok, true);
  assert.equal(outcome.status, "completed");
  assert.deepEqual(deletedAuthUsers, ["user_1"]);
  assert.deepEqual(storage.deletedFiles, ["users/user_1/wardrobe/item_a/original"]);
  assert.ok(firestore.deletedPaths.includes("users/user_1"));
  assert.ok(firestore.deletedPaths.includes("wardrobeItems/item_1"));
  assert.ok(firestore.deletedPaths.includes("outfitRecommendations/rec_1"));
  assert.equal(firestore.deletedPaths.some((path) => path.startsWith("adminAuditLogs/")), false);
  assert.equal(firestore.deletedPaths.some((path) => path.startsWith("userDeletionRequests/")), false);

  const statusWrites = firestore.documentSets.filter((set) => set.path === "userDeletionRequests/user_1");
  assert.equal((statusWrites[0]?.data as { status?: string }).status, "processing");
  assert.equal((statusWrites[1]?.data as { status?: string }).status, "completed");

  assert.deepEqual(
    firestore.auditLogs.map((auditLog) => (auditLog as DeletionAuditLogPayload).action),
    [
      deletionAuditActions.requested,
      deletionAuditActions.processingStarted,
      deletionAuditActions.firestoreCompleted,
      deletionAuditActions.storageCompleted,
      deletionAuditActions.authCompleted,
      deletionAuditActions.completed
    ]
  );
});
