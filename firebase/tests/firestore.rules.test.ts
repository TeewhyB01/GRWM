import test, { after, before, beforeEach } from "node:test";

import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";

import { firestorePathBuilders } from "./helpers/paths.ts";
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

test("user can read and write their own wardrobeItems", async () => {
  const db = firestoreFor(testUserIds.userA);
  const wardrobePath = firestorePathBuilders.wardrobeItem(sampleWardrobeItem.id);

  await assertSucceeds(db.doc(wardrobePath).set(asDocumentData(sampleWardrobeItem)));
  await assertSucceeds(db.doc(wardrobePath).get());
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
});
