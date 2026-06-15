import { firestoreCollections, storagePaths } from "@grwm/shared";

export const firestorePathBuilders = {
  user(userId: string): string {
    return `${firestoreCollections.users}/${userId}`;
  },
  userProfile(profileId: string): string {
    return `${firestoreCollections.userProfiles}/${profileId}`;
  },
  privacyConsent(consentId: string): string {
    return `${firestoreCollections.privacyConsents}/${consentId}`;
  },
  wardrobeSetupProfile(userId: string): string {
    return `${firestoreCollections.wardrobeSetupProfiles}/${userId}`;
  },
  styleProfile(userId: string): string {
    return `${firestoreCollections.styleProfiles}/${userId}`;
  },
  avatarProfile(userId: string): string {
    return `${firestoreCollections.avatarProfiles}/${userId}`;
  },
  subscription(userId: string): string {
    return `${firestoreCollections.subscriptions}/${userId}`;
  },
  wardrobeItem(itemId: string): string {
    return `${firestoreCollections.wardrobeItems}/${itemId}`;
  },
  outfitRecommendation(recommendationId: string): string {
    return `${firestoreCollections.outfitRecommendations}/${recommendationId}`;
  },
  userDeletionRequest(requestId: string): string {
    return `${firestoreCollections.userDeletionRequests}/${requestId}`;
  },
  adminUser(userId: string): string {
    return `${firestoreCollections.adminUsers}/${userId}`;
  },
  adminAuditLog(logId: string): string {
    return `${firestoreCollections.adminAuditLogs}/${logId}`;
  }
} as const;

export const storagePathBuilders = {
  wardrobeOriginal(userId: string, itemId: string): string {
    return storagePaths.wardrobeOriginal(userId, itemId).path;
  },
  stylePhotoOriginal(userId: string, photoId: string): string {
    return storagePaths.stylePhotoOriginal(userId, photoId).path;
  },
  avatarSourceOriginal(userId: string, photoId: string): string {
    return storagePaths.avatarSourceOriginal(userId, photoId).path;
  },
  avatarGenerated(userId: string, generationId: string): string {
    return storagePaths.avatarGenerated(userId, generationId).path;
  },
  outfit(userId: string, outfitId: string): string {
    return storagePaths.outfit(userId, outfitId).path;
  }
} as const;
