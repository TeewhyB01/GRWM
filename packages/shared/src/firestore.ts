export const firestoreCollections = {
  users: "users",
  userProfiles: "userProfiles",
  privacyConsents: "privacyConsents",
  wardrobeSetupProfiles: "wardrobeSetupProfiles",
  wardrobeItems: "wardrobeItems",
  styleProfiles: "styleProfiles",
  outfitRecommendations: "outfitRecommendations",
  avatarProfiles: "avatarProfiles",
  subscriptions: "subscriptions",
  adminUsers: "adminUsers",
  adminAuditLogs: "adminAuditLogs",
  userDeletionRequests: "userDeletionRequests"
} as const;

export type FirestoreCollectionKey = keyof typeof firestoreCollections;
export type FirestoreCollectionName = (typeof firestoreCollections)[FirestoreCollectionKey];

export const futureUserOwnedFirestoreCollections = [
  "savedOutfits",
  "wornOutfits",
  "outfitPhotos",
  "avatarGenerations",
  "shoppingRecommendations",
  "affiliateClicks",
  "payments",
  "aiJobs",
  "aiUsageLogs",
  "userFeedback",
  "reports"
] as const;

export type FutureUserOwnedFirestoreCollection = (typeof futureUserOwnedFirestoreCollections)[number];

export const userOwnedCollectionNames = [
  firestoreCollections.users,
  firestoreCollections.userProfiles,
  firestoreCollections.privacyConsents,
  firestoreCollections.wardrobeSetupProfiles,
  firestoreCollections.wardrobeItems,
  firestoreCollections.styleProfiles,
  firestoreCollections.outfitRecommendations,
  firestoreCollections.avatarProfiles,
  firestoreCollections.userDeletionRequests
] as const;

export function userScopedDocumentPath(collection: FirestoreCollectionName, userId: string, documentId = userId): string {
  return `${collection}/${documentId}`;
}
