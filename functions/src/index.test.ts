import assert from "node:assert/strict";
import test from "node:test";

import { functionsFoundation } from "./foundation.ts";
import { functionsEnvKeys, getFunctionsRuntimeConfig } from "./config.ts";
import { createUserProfileOnSignupContract } from "./placeholders/createUserProfileOnSignup.ts";
import { recordPrivacyConsentContract } from "./placeholders/recordPrivacyConsent.ts";
import { createPlaceholderResponse, functionPlaceholders } from "./placeholders/registry.ts";
import { requestUserDataDeletionContract } from "./placeholders/requestUserDataDeletion.ts";
import { validateAdminRoleContract } from "./placeholders/validateAdminRole.ts";
import {
  detectWardrobeStorageOrphans,
  expectedWardrobeOriginalPath,
  isWardrobeOriginalStoragePath,
  wardrobeOrphanCleanupPolicy
} from "./storage/orphanCleanup.ts";

test("@grwm/functions targets Firebase Cloud Functions", () => {
  assert.equal(functionsFoundation.runtime, "firebase-cloud-functions");
});

test("@grwm/functions keeps sensitive logging disabled by default", () => {
  assert.equal(functionsFoundation.sensitiveLoggingAllowed, false);
});

test("@grwm/functions registers the Phase 1 placeholder functions", () => {
  assert.deepEqual(
    functionPlaceholders.map((placeholder) => placeholder.exportedName),
    [
      "wardrobeAnalysis",
      "dailyOutfitRecommendation",
      "occasionOutfitRecommendation",
      "avatarGenerationRequest",
      "affiliateClickTracking",
      "subscriptionWebhook",
      "createUserProfileOnSignup",
      "requestUserDataDeletion",
      "logAdminAction",
      "recordPrivacyConsent",
      "validateAdminRole"
    ]
  );
});

test("@grwm/functions keeps placeholder responses explicit", () => {
  assert.deepEqual(createPlaceholderResponse("wardrobe-analysis", "user_1"), {
    ok: false,
    placeholderId: "wardrobe-analysis",
    status: "not-implemented",
    authenticatedUserId: "user_1",
    message: "This Firebase Function is reserved for a future implementation phase."
  });
});

test("@grwm/functions documents auth and privacy placeholder contracts", () => {
  assert.deepEqual(createUserProfileOnSignupContract.reservedWrites, ["users", "userProfiles"]);
  assert.equal(recordPrivacyConsentContract.source, "mobile");
  assert.deepEqual(recordPrivacyConsentContract.reservedWrites, ["privacyConsents"]);
  assert.deepEqual(requestUserDataDeletionContract.reservedWrites, ["userDeletionRequests"]);
  assert.equal(requestUserDataDeletionContract.clientDeletesDataImmediately, false);
  assert.deepEqual(validateAdminRoleContract.supportedRoles, [
    "owner",
    "admin",
    "moderator",
    "support",
    "analyst"
  ]);
});

test("@grwm/functions defines environment-backed runtime config", () => {
  assert.ok(functionsEnvKeys.includes("FIREBASE_PROJECT_ID"));
  assert.equal(getFunctionsRuntimeConfig().region, "us-central1");
});

test("@grwm/functions scaffolds non-destructive wardrobe orphan detection", () => {
  const existingPath = expectedWardrobeOriginalPath({
    id: "item_1",
    userId: "user_1"
  });
  const orphanPath = expectedWardrobeOriginalPath({
    id: "item_orphan",
    userId: "user_1"
  });
  const missingPath = expectedWardrobeOriginalPath({
    id: "item_missing_file",
    userId: "user_1"
  });

  assert.equal(isWardrobeOriginalStoragePath(existingPath), true);
  assert.equal(isWardrobeOriginalStoragePath("users/user_1/public/item_1"), false);
  assert.equal(wardrobeOrphanCleanupPolicy.destructiveCleanupEnabled, false);
  assert.equal(wardrobeOrphanCleanupPolicy.uploadPendingAgeThresholdMs, 24 * 60 * 60 * 1000);

  assert.deepEqual(
    detectWardrobeStorageOrphans({
      nowIso: "2026-06-15T00:00:00.000Z",
      storageObjects: [
        {
          name: existingPath,
          metadata: {
            ownerId: "user_1",
            userId: "user_1",
            itemId: "item_1",
            uploadCategory: "wardrobe-original",
            consentVersion: "2026-06-foundation",
            storagePath: existingPath
          }
        },
        {
          name: orphanPath,
          metadata: {
            ownerId: "user_1",
            userId: "user_1",
            itemId: "item_wrong",
            uploadCategory: "wardrobe-original",
            consentVersion: "2026-06-foundation",
            storagePath: orphanPath
          }
        },
        { name: "users/user_1/style-photos/photo_1/original" }
      ],
      wardrobeItems: [
        {
          id: "item_1",
          userId: "user_1",
          storagePath: existingPath,
          uploadStatus: "uploaded",
          updatedAtIso: "2026-06-15T00:00:00.000Z"
        },
        {
          id: "item_missing_file",
          userId: "user_1",
          storagePath: missingPath,
          uploadStatus: "upload_pending",
          updatedAtIso: "2026-06-13T00:00:00.000Z"
        },
        {
          id: "item_failed",
          userId: "user_1",
          storagePath: expectedWardrobeOriginalPath({
            id: "item_failed",
            userId: "user_1"
          }),
          uploadStatus: "upload_failed",
          updatedAtIso: "2026-06-15T00:00:00.000Z"
        }
      ]
    }),
    {
      failedWardrobeItemIdsNeedingReview: ["item_failed"],
      metadataMismatchStorageObjectPaths: [orphanPath],
      orphanedStorageObjectPaths: [orphanPath],
      pendingWardrobeItemIdsPastThreshold: ["item_missing_file"],
      wardrobeItemIdsMissingStorageObjects: ["item_missing_file", "item_failed"]
    }
  );
});
