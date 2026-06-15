import test, { after, before, beforeEach } from "node:test";

import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";

import { firestorePathBuilders, storagePathBuilders } from "./helpers/paths.ts";
import {
  createSeedAdminAuditLog,
  createSeedAdminUser,
  createSeedDeletionRequest,
  createSeedOutfitRecommendation,
  createSeedPrivacyConsent,
  createSeedUserProfile,
  createSeedWardrobeItem,
  localSeedAdminUsers,
  localSeedUsers,
  sampleDeletionRequest,
  samplePrivacyConsent,
  sampleUserProfile,
  sampleWardrobeItem
} from "./helpers/seedData.ts";
import { testDocumentIds, testEmails, testUserIds } from "./helpers/ids.ts";
import {
  authenticatedTestContext,
  cleanupRulesTestEnvironment,
  clearFirestoreEmulator,
  initializeRulesTestEnvironment,
  ownerAdminTestContext,
  seedFirestoreDocuments,
  unauthenticatedTestContext
} from "./helpers/testEnvironment.ts";

let testEnv: RulesTestEnvironment;

function asDocumentData<T extends object>(data: T): Record<string, unknown> {
  return data as Record<string, unknown>;
}

function firestoreFor(userId: string) {
  return authenticatedTestContext(testEnv, userId).firestore();
}

before(async () => {
  testEnv = await initializeRulesTestEnvironment(["firestore"]);
});

beforeEach(async () => {
  await clearFirestoreEmulator(testEnv);
});

after(async () => {
  await cleanupRulesTestEnvironment(testEnv);
});

test("authenticated user can read and write their own user document", async () => {
  const db = firestoreFor(testUserIds.userA);
  const userPath = firestorePathBuilders.user(testUserIds.userA);

  await assertSucceeds(db.doc(userPath).set(asDocumentData(localSeedUsers.userA)));
  await assertSucceeds(db.doc(userPath).get());
});

test("user cannot read another user's user document", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.user(testUserIds.userB),
      data: asDocumentData(localSeedUsers.userB)
    }
  ]);

  await assertFails(firestoreFor(testUserIds.userA).doc(firestorePathBuilders.user(testUserIds.userB)).get());
});

test("user cannot write another user's user document", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.user(testUserIds.userB))
      .set(asDocumentData(localSeedUsers.userB))
  );
});

test("user can read and write their own userProfile", async () => {
  const db = firestoreFor(testUserIds.userA);
  const profilePath = firestorePathBuilders.userProfile(sampleUserProfile.id);

  await assertSucceeds(db.doc(profilePath).set(asDocumentData(sampleUserProfile)));
  await assertSucceeds(db.doc(profilePath).get());
});

test("user cannot read or write another user's userProfile", async () => {
  const userBProfile = createSeedUserProfile({
    id: testDocumentIds.userProfileB,
    userId: testUserIds.userB,
    displayName: "Local User B"
  });

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.userProfile(userBProfile.id),
      data: asDocumentData(userBProfile)
    }
  ]);

  const userADb = firestoreFor(testUserIds.userA);

  await assertFails(userADb.doc(firestorePathBuilders.userProfile(userBProfile.id)).get());
  await assertFails(userADb.doc(firestorePathBuilders.userProfile(userBProfile.id)).set(asDocumentData(userBProfile)));
});

test("user can read and write their own privacyConsents", async () => {
  const db = firestoreFor(testUserIds.userA);
  const consentPath = firestorePathBuilders.privacyConsent(samplePrivacyConsent.id);

  await assertSucceeds(db.doc(consentPath).set(asDocumentData(samplePrivacyConsent)));
  await assertSucceeds(db.doc(consentPath).get());
});

test("user can read missing own privacyConsent as not found", async () => {
  await assertSucceeds(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.privacyConsent(testUserIds.userA))
      .get()
  );
});

test("user cannot read missing privacyConsent for another user", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.privacyConsent(testUserIds.userB))
      .get()
  );
});

test("user cannot read or write another user's privacyConsents", async () => {
  const userBConsent = createSeedPrivacyConsent({
    id: testDocumentIds.privacyConsentB,
    userId: testUserIds.userB
  });

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.privacyConsent(userBConsent.id),
      data: asDocumentData(userBConsent)
    }
  ]);

  const userADb = firestoreFor(testUserIds.userA);

  await assertFails(userADb.doc(firestorePathBuilders.privacyConsent(userBConsent.id)).get());
  await assertFails(userADb.doc(firestorePathBuilders.privacyConsent(userBConsent.id)).set(asDocumentData(userBConsent)));
});

test("user can create their own userDeletionRequest", async () => {
  await assertSucceeds(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id))
      .set(asDocumentData(sampleDeletionRequest))
  );
});

test("user cannot create deletion request for another user", async () => {
  const userBDeletionRequest = createSeedDeletionRequest({
    id: testUserIds.userB,
    userId: testUserIds.userB
  });

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.userDeletionRequest(userBDeletionRequest.id))
      .set(asDocumentData(userBDeletionRequest))
  );
});

test("user cannot create deletion request with extra personal fields", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id))
      .set({
        ...asDocumentData(sampleDeletionRequest),
        reason: "Please delete my account."
      })
  );
});

test("user can read their own deletion request status", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id),
      data: asDocumentData(sampleDeletionRequest)
    }
  ]);

  await assertSucceeds(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id))
      .get()
  );
});

test("user cannot update deletion request status from the client", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id),
      data: asDocumentData(sampleDeletionRequest)
    }
  ]);

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id))
      .update({
        status: "completed",
        completedAtIso: "2026-06-08T00:05:00.000Z"
      })
  );
});

test("admin client cannot update deletion request lifecycle status", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.adminUser(localSeedAdminUsers.ownerAdmin.id),
      data: asDocumentData(localSeedAdminUsers.ownerAdmin)
    },
    {
      path: firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id),
      data: asDocumentData(sampleDeletionRequest)
    }
  ]);

  await assertFails(
    ownerAdminTestContext(testEnv)
      .firestore()
      .doc(firestorePathBuilders.userDeletionRequest(sampleDeletionRequest.id))
      .update({
        status: "completed",
        completedAtIso: "2026-06-08T00:05:00.000Z"
      })
  );
});

test("valid wardrobe item create succeeds", async () => {
  const db = firestoreFor(testUserIds.userA);
  const wardrobePath = firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id);

  await assertSucceeds(db.doc(wardrobePath).set(asDocumentData(sampleWardrobeItem)));
  await assertSucceeds(db.doc(wardrobePath).get());
});

test("wardrobe item create with userId mismatch is denied", async () => {
  const mismatchWardrobeItem = createSeedWardrobeItem({
    id: testDocumentIds.wardrobeItemA,
    userId: testUserIds.userB
  });

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(mismatchWardrobeItem.id))
      .set(asDocumentData(mismatchWardrobeItem))
  );
});

test("wardrobe item create with ownerId mismatch is denied", async () => {
  const mismatchWardrobeItem = {
    ...asDocumentData(sampleWardrobeItem),
    ownerId: testUserIds.userB
  };

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set(mismatchWardrobeItem)
  );
});

test("wardrobe item create without required fields is denied", async () => {
  const missingPrimaryColour = { ...asDocumentData(sampleWardrobeItem) };

  delete missingPrimaryColour.primaryColour;

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set(missingPrimaryColour)
  );
});

test("wardrobe item create cannot claim backend uploaded status", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set({
        ...asDocumentData(sampleWardrobeItem),
        uploadStatus: "uploaded",
        uploadedAtIso: "2026-06-08T00:10:00.000Z"
      })
  );
});

test("wardrobe item create cannot claim completed analysis", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set({
        ...asDocumentData(sampleWardrobeItem),
        analysisStatus: "completed",
        analysisConsentVersion: "2026-06-foundation"
      })
  );
});

test("wardrobe item create with invalid analysisStatus is denied", async () => {
  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set({
        ...asDocumentData(sampleWardrobeItem),
        analysisStatus: "unsafe"
      })
  );
});

test("unauthenticated user cannot create wardrobe item", async () => {
  await assertFails(
    unauthenticatedTestContext(testEnv)
      .firestore()
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .set(asDocumentData(sampleWardrobeItem))
  );
});

test("wardrobe item update cannot change owner userId", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id),
      data: asDocumentData(sampleWardrobeItem)
    }
  ]);

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .update({
        userId: testUserIds.userB,
        updatedAtIso: "2026-06-08T00:10:00.000Z"
      })
  );
});

test("wardrobe item update cannot change ownerId, storagePath, or source", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id),
      data: asDocumentData(sampleWardrobeItem)
    }
  ]);

  const db = firestoreFor(testUserIds.userA);
  const path = firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id);

  await assertFails(db.doc(path).update({
    ownerId: testUserIds.userB,
    updatedAtIso: "2026-06-08T00:10:00.000Z"
  }));
  await assertFails(db.doc(path).update({
    storagePath: storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemB),
    updatedAtIso: "2026-06-08T00:10:00.000Z"
  }));
  await assertFails(db.doc(path).update({
    source: "future_ai",
    updatedAtIso: "2026-06-08T00:10:00.000Z"
  }));
});

test("wardrobe item update cannot change backend-owned upload lifecycle fields", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id),
      data: asDocumentData(sampleWardrobeItem)
    }
  ]);

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .update({
        uploadStatus: "uploaded",
        uploadedAtIso: "2026-06-08T00:10:00.000Z",
        updatedAtIso: "2026-06-08T00:10:00.000Z"
      })
  );
});

test("wardrobe item update cannot change backend-owned analysis fields", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id),
      data: asDocumentData(sampleWardrobeItem)
    }
  ]);

  await assertFails(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .update({
        analysisStatus: "completed",
        analysisConsentVersion: "2026-06-foundation",
        updatedAtIso: "2026-06-08T00:10:00.000Z"
      })
  );
});

test("valid user-owned non-AI wardrobe item update succeeds", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id),
      data: asDocumentData(sampleWardrobeItem)
    }
  ]);

  await assertSucceeds(
    firestoreFor(testUserIds.userA)
      .doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id))
      .update({
        name: "Local test jacket updated",
        primaryColour: "black",
        colorTags: ["black"],
        updatedAtIso: "2026-06-08T00:10:00.000Z"
      })
  );
});

test("user cannot read or write another user's wardrobeItems", async () => {
  const userBWardrobeItem = createSeedWardrobeItem({
    id: testDocumentIds.wardrobeItemB,
    userId: testUserIds.userB
  });

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.wardrobeItem(userBWardrobeItem.id),
      data: asDocumentData(userBWardrobeItem)
    }
  ]);

  const userADb = firestoreFor(testUserIds.userA);

  await assertFails(userADb.doc(firestorePathBuilders.wardrobeItem(userBWardrobeItem.id)).get());
  await assertFails(userADb.doc(firestorePathBuilders.wardrobeItem(userBWardrobeItem.id)).set(asDocumentData(userBWardrobeItem)));
});

test("user can read their own outfitRecommendations", async () => {
  const recommendation = createSeedOutfitRecommendation({
    id: testDocumentIds.outfitRecommendationA,
    userId: testUserIds.userA
  });

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.outfitRecommendation(recommendation.id),
      data: asDocumentData(recommendation)
    }
  ]);

  await assertSucceeds(
    firestoreFor(testUserIds.userA).doc(firestorePathBuilders.outfitRecommendation(recommendation.id)).get()
  );
});

test("user cannot read another user's outfitRecommendations", async () => {
  const recommendation = createSeedOutfitRecommendation({
    id: testDocumentIds.outfitRecommendationB,
    userId: testUserIds.userB
  });

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.outfitRecommendation(recommendation.id),
      data: asDocumentData(recommendation)
    }
  ]);

  await assertFails(
    firestoreFor(testUserIds.userA).doc(firestorePathBuilders.outfitRecommendation(recommendation.id)).get()
  );
});

test("standard user cannot access adminUsers", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.adminUser(localSeedAdminUsers.ownerAdmin.id),
      data: asDocumentData(localSeedAdminUsers.ownerAdmin)
    }
  ]);

  const userADb = firestoreFor(testUserIds.userA);
  const attemptedAdminUser = createSeedAdminUser({
    userId: testUserIds.userA,
    email: testEmails.userA,
    roles: ["support"]
  });

  await assertFails(userADb.doc(firestorePathBuilders.adminUser(localSeedAdminUsers.ownerAdmin.id)).get());
  await assertFails(userADb.doc(firestorePathBuilders.adminUser(testUserIds.userA)).set(asDocumentData(attemptedAdminUser)));
});

test("standard user cannot access adminAuditLogs", async () => {
  const auditLog = createSeedAdminAuditLog();

  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.adminAuditLog(auditLog.id),
      data: asDocumentData(auditLog)
    }
  ]);

  const userADb = firestoreFor(testUserIds.userA);

  await assertFails(userADb.doc(firestorePathBuilders.adminAuditLog(auditLog.id)).get());
  await assertFails(userADb.doc(firestorePathBuilders.adminAuditLog("admin-audit-attempt")).set(asDocumentData(auditLog)));
});

test("unauthenticated users are denied private Firestore data", async () => {
  await seedFirestoreDocuments(testEnv, [
    {
      path: firestorePathBuilders.user(testUserIds.userA),
      data: asDocumentData(localSeedUsers.userA)
    }
  ]);

  const db = unauthenticatedTestContext(testEnv).firestore();

  await assertFails(db.doc(firestorePathBuilders.user(testUserIds.userA)).get());
  await assertFails(db.doc(firestorePathBuilders.userProfile(sampleUserProfile.id)).set(asDocumentData(sampleUserProfile)));
  await assertFails(db.doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id)).get());
  await assertFails(db.doc(firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id)).set(asDocumentData(sampleWardrobeItem)));
});
