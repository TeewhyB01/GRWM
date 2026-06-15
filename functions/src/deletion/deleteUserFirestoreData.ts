import {
  firestoreCollections,
  futureUserOwnedFirestoreCollections
} from "@grwm/shared";
import type {
  DocumentReference,
  Firestore
} from "firebase-admin/firestore";

import {
  assertSafeUserId,
  type FirestoreDeletionResult
} from "./types.ts";

const ownerDocumentCollections = [
  firestoreCollections.users,
  firestoreCollections.userProfiles,
  firestoreCollections.privacyConsents,
  firestoreCollections.wardrobeSetupProfiles,
  firestoreCollections.styleProfiles,
  firestoreCollections.avatarProfiles,
  firestoreCollections.subscriptions
] as const;

const currentQueryByUserIdCollections = [
  firestoreCollections.wardrobeItems,
  firestoreCollections.outfitRecommendations
] as const;

export const retainedDeletionCollections = [
  firestoreCollections.userDeletionRequests,
  firestoreCollections.adminUsers,
  firestoreCollections.adminAuditLogs
] as const;

export function getUserFirestoreDeletionPlan(userId: string): FirestoreDeletionResult {
  const safeUserId = assertSafeUserId(userId);
  const queryByUserIdCollections = [
    ...currentQueryByUserIdCollections,
    ...futureUserOwnedFirestoreCollections
  ];

  return {
    deletedDocumentCount: 0,
    ownerDocumentPaths: ownerDocumentCollections.map((collection) => `${collection}/${safeUserId}`),
    queryByUserIdCollections
  };
}

async function deleteDocumentReferences(
  db: Firestore,
  documentReferences: readonly DocumentReference[]
): Promise<number> {
  let deletedDocumentCount = 0;

  for (let index = 0; index < documentReferences.length; index += 450) {
    const batch = db.batch();
    const chunk = documentReferences.slice(index, index + 450);

    for (const documentReference of chunk) {
      batch.delete(documentReference);
    }

    await batch.commit();
    deletedDocumentCount += chunk.length;
  }

  return deletedDocumentCount;
}

export async function deleteUserFirestoreData(
  db: Firestore,
  userId: string
): Promise<FirestoreDeletionResult> {
  const plan = getUserFirestoreDeletionPlan(userId);
  const ownerDocumentReferences = plan.ownerDocumentPaths.map((path) => db.doc(path));
  let deletedDocumentCount = await deleteDocumentReferences(db, ownerDocumentReferences);

  for (const collection of plan.queryByUserIdCollections) {
    const snapshot = await db.collection(collection).where("userId", "==", userId).get();

    deletedDocumentCount += await deleteDocumentReferences(
      db,
      snapshot.docs.map((documentSnapshot) => documentSnapshot.ref)
    );
  }

  return {
    ...plan,
    deletedDocumentCount
  };
}
