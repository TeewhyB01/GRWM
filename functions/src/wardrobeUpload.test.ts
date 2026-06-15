import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_WARDROBE_IMAGE_BYTES,
  PRIVACY_CONSENT_VERSION,
  buildWardrobeUploadMetadata,
  createDefaultPrivacyConsent,
  storagePaths,
  type WardrobeItem
} from "@grwm/shared";

import {
  evaluateWardrobeAnalysisRequest,
  finaliseWardrobeUpload,
  verifyWardrobeStorageObject,
  type WardrobeStorageObjectSnapshot,
  type WardrobeUploadFinalisationDependencies
} from "./wardrobeUpload/index.ts";

const testNowIso = "2026-06-15T10:00:00.000Z";

function createWardrobeItem(params: {
  itemId: string;
  userId: string;
}): WardrobeItem {
  return {
    id: params.itemId,
    itemId: params.itemId,
    userId: params.userId,
    ownerId: params.userId,
    name: "Local jacket",
    notes: "",
    category: "outerwear",
    primaryColour: "navy",
    colorTags: ["navy"],
    seasonTags: [],
    occasionTags: [],
    storagePath: storagePaths.wardrobeOriginal(params.userId, params.itemId).path,
    visibility: "private",
    source: "manual",
    uploadStatus: "upload_pending",
    uploadFailureReason: "",
    uploadedAtIso: "",
    uploadFailedAtIso: "",
    analysisStatus: "not_requested",
    analysisConsentVersion: "",
    createdAtIso: testNowIso,
    updatedAtIso: testNowIso
  };
}

function createStorageObject(params: {
  contentType?: string;
  itemId: string;
  metadataOverrides?: Record<string, string>;
  size?: number;
  userId: string;
}): WardrobeStorageObjectSnapshot {
  const metadata = buildWardrobeUploadMetadata({
    category: "outerwear",
    consentVersion: PRIVACY_CONSENT_VERSION,
    itemId: params.itemId,
    userId: params.userId
  });

  return {
    contentType: params.contentType ?? "image/jpeg",
    metadata: {
      ...metadata,
      ...params.metadataOverrides
    },
    name: metadata.storagePath,
    size: params.size ?? 1024
  };
}

function createFakeWardrobeUploadDeps(initialWardrobeItems: readonly WardrobeItem[] = []) {
  const wardrobeItems = new Map<string, Record<string, unknown>>(
    initialWardrobeItems.map((item) => [item.id, { ...item }])
  );
  const auditLogs: Record<string, unknown>[] = [];
  const setWrites: {
    collectionName: string;
    data: unknown;
    documentId: string;
  }[] = [];
  let auditIndex = 0;

  const deps: WardrobeUploadFinalisationDependencies = {
    db: {
      collection(collectionName: string) {
        return {
          doc(id?: string) {
            const documentId = id ?? `audit_${++auditIndex}`;

            return {
              id: documentId,
              async get() {
                return {
                  exists: wardrobeItems.has(documentId),
                  data() {
                    return wardrobeItems.get(documentId);
                  }
                };
              },
              async set(data: unknown, options?: { merge: boolean }) {
                setWrites.push({ collectionName, data, documentId });

                if (collectionName === "wardrobeItems") {
                  const existing = wardrobeItems.get(documentId) ?? {};
                  wardrobeItems.set(
                    documentId,
                    options?.merge ? { ...existing, ...(data as Record<string, unknown>) } : data as Record<string, unknown>
                  );
                }

                if (collectionName === "adminAuditLogs") {
                  auditLogs.push(data as Record<string, unknown>);
                }
              }
            };
          }
        };
      }
    },
    logger: console,
    nowIso: () => testNowIso
  };

  return {
    auditLogs,
    deps,
    setWrites,
    wardrobeItems
  };
}

test("wardrobe Storage object verification accepts valid private uploads", () => {
  const storageObject = createStorageObject({
    itemId: "item_1",
    userId: "user_1"
  });

  assert.deepEqual(verifyWardrobeStorageObject(storageObject), {
    ok: true,
    contentType: "image/jpeg",
    itemId: "item_1",
    metadata: storageObject.metadata,
    sizeBytes: 1024,
    storagePath: "users/user_1/wardrobe/item_1/original",
    userId: "user_1"
  });
});

test("valid Storage object finalises wardrobe upload without creating analysis work", async () => {
  const item = createWardrobeItem({
    itemId: "item_1",
    userId: "user_1"
  });
  const fake = createFakeWardrobeUploadDeps([item]);

  const result = await finaliseWardrobeUpload({
    deps: fake.deps,
    storageObject: createStorageObject({
      itemId: "item_1",
      userId: "user_1"
    })
  });

  assert.equal(result.ok, true);
  assert.equal(result.uploadStatus, "uploaded");
  assert.equal(result.analysisStatus, "not_requested");
  assert.equal(fake.wardrobeItems.get("item_1")?.uploadStatus, "uploaded");
  assert.equal(fake.wardrobeItems.get("item_1")?.analysisStatus, "not_requested");
  assert.equal(JSON.stringify(fake.auditLogs).includes("users/user_1/wardrobe/item_1/original"), false);
});

test("duplicate Storage object finalisation leaves uploaded wardrobe item stable", async () => {
  const item = {
    ...createWardrobeItem({
      itemId: "item_1",
      userId: "user_1"
    }),
    uploadStatus: "uploaded" as const,
    uploadedAtIso: "2026-06-15T09:00:00.000Z",
    updatedAtIso: "2026-06-15T09:00:00.000Z"
  };
  const fake = createFakeWardrobeUploadDeps([item]);

  const result = await finaliseWardrobeUpload({
    deps: fake.deps,
    storageObject: createStorageObject({
      itemId: "item_1",
      userId: "user_1"
    })
  });

  assert.equal(result.ok, true);
  assert.equal(result.uploadStatus, "uploaded");
  assert.equal(result.auditLogId, "");
  assert.equal(fake.wardrobeItems.get("item_1")?.uploadedAtIso, "2026-06-15T09:00:00.000Z");
  assert.equal(fake.auditLogs.length, 0);
});

test("metadata mismatch marks existing wardrobe upload failed safely", async () => {
  const item = createWardrobeItem({
    itemId: "item_1",
    userId: "user_1"
  });
  const fake = createFakeWardrobeUploadDeps([item]);

  const result = await finaliseWardrobeUpload({
    deps: fake.deps,
    storageObject: createStorageObject({
      itemId: "item_1",
      metadataOverrides: {
        ownerId: "user_2"
      },
      userId: "user_1"
    })
  });

  assert.equal(result.ok, false);
  assert.equal(result.failureReason, "metadata_mismatch");
  assert.equal(fake.wardrobeItems.get("item_1")?.uploadStatus, "upload_failed");
  assert.equal(fake.wardrobeItems.get("item_1")?.uploadFailureReason, "metadata_mismatch");
});

test("missing wardrobe record fails safely without creating a partial item", async () => {
  const fake = createFakeWardrobeUploadDeps();

  const result = await finaliseWardrobeUpload({
    deps: fake.deps,
    storageObject: createStorageObject({
      itemId: "item_1",
      userId: "user_1"
    })
  });

  assert.equal(result.ok, false);
  assert.equal(result.failureReason, "missing_wardrobe_item");
  assert.equal(fake.wardrobeItems.has("item_1"), false);
});

test("wardrobe record user mismatch fails safely", async () => {
  const fake = createFakeWardrobeUploadDeps([
    {
      ...createWardrobeItem({
        itemId: "item_1",
        userId: "user_2"
      }),
      id: "item_1",
      itemId: "item_1"
    }
  ]);

  const result = await finaliseWardrobeUpload({
    deps: fake.deps,
    storageObject: createStorageObject({
      itemId: "item_1",
      userId: "user_1"
    })
  });

  assert.equal(result.ok, false);
  assert.equal(result.failureReason, "user_mismatch");
  assert.equal(fake.wardrobeItems.get("item_1")?.uploadStatus, "upload_pending");
});

test("invalid content type and oversized wardrobe objects fail verification", () => {
  assert.deepEqual(
    verifyWardrobeStorageObject(createStorageObject({
      contentType: "application/pdf",
      itemId: "item_1",
      userId: "user_1"
    })),
    {
      ok: false,
      failureReason: "invalid_content_type",
      itemId: "item_1",
      storagePath: "users/user_1/wardrobe/item_1/original",
      userId: "user_1"
    }
  );
  assert.deepEqual(
    verifyWardrobeStorageObject(createStorageObject({
      itemId: "item_1",
      size: MAX_WARDROBE_IMAGE_BYTES + 1,
      userId: "user_1"
    })),
    {
      ok: false,
      failureReason: "file_too_large",
      itemId: "item_1",
      storagePath: "users/user_1/wardrobe/item_1/original",
      userId: "user_1"
    }
  );
});

test("missing wardrobe photo analysis consent blocks future request without AI job", () => {
  const consent = createDefaultPrivacyConsent({
    id: "user_1",
    userId: "user_1",
    createdAtIso: testNowIso
  });

  assert.deepEqual(
    evaluateWardrobeAnalysisRequest({
      consent,
      payload: {
        userId: "user_1",
        ownerId: "user_1",
        itemId: "item_1",
        requestedAtIso: testNowIso,
        consentVersion: consent.version
      }
    }),
    {
      ok: false,
      analysisStatus: "blocked_missing_consent",
      failureReason: "blocked_missing_consent",
      aiJobCreated: false
    }
  );
});
