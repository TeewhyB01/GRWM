export const firestoreCollections = {
  users: "users",
  userProfiles: "userProfiles",
  privacyConsents: "privacyConsents",
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

export const userOwnedCollectionNames = [
  firestoreCollections.users,
  firestoreCollections.userProfiles,
  firestoreCollections.privacyConsents,
  firestoreCollections.wardrobeItems,
  firestoreCollections.styleProfiles,
  firestoreCollections.outfitRecommendations,
  firestoreCollections.avatarProfiles,
  firestoreCollections.userDeletionRequests
] as const;

export function userScopedDocumentPath(collection: FirestoreCollectionName, userId: string, documentId = userId): string {
  return `${collection}/${documentId}`;
}
