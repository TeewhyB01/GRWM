export const testUserIds = {
  userA: "local-user-a",
  userB: "local-user-b",
  deletionTestUser: "deletion-test-user",
  unaffectedUser: "unaffected-user",
  ownerAdmin: "local-admin-owner",
  moderatorAdmin: "local-admin-moderator"
} as const;

export const testEmails = {
  userA: "user-a@example.test",
  userB: "user-b@example.test",
  deletionTestUser: "deletion-test-user@example.test",
  unaffectedUser: "unaffected-user@example.test",
  ownerAdmin: "owner-admin@example.test",
  moderatorAdmin: "moderator-admin@example.test"
} as const;

export const testDocumentIds = {
  userProfileA: "profile-local-user-a",
  userProfileB: "profile-local-user-b",
  privacyConsentA: "consent-local-user-a",
  privacyConsentB: "consent-local-user-b",
  wardrobeItemA: "wardrobe-local-user-a",
  wardrobeItemB: "wardrobe-local-user-b",
  wardrobeItemDeletionTestUser: "wardrobe-deletion-test-user",
  wardrobeItemUnaffectedUser: "wardrobe-unaffected-user",
  outfitRecommendationA: "outfit-recommendation-local-user-a",
  outfitRecommendationB: "outfit-recommendation-local-user-b",
  outfitRecommendationDeletionTestUser: "outfit-recommendation-deletion-test-user",
  outfitRecommendationUnaffectedUser: "outfit-recommendation-unaffected-user",
  userDeletionRequestA: "deletion-request-local-user-a",
  userDeletionRequestB: "deletion-request-local-user-b",
  userDeletionRequestDeletionTestUser: "deletion-test-user",
  userDeletionRequestUnaffectedUser: "unaffected-user",
  adminAuditLog: "admin-audit-local-1",
  adminAuditLogDeletionTrigger: "admin-audit-deletion-trigger",
  stylePhotoA: "style-photo-local-user-a",
  avatarSourcePhotoA: "avatar-source-local-user-a",
  avatarGenerationA: "avatar-generation-local-user-a"
} as const;
