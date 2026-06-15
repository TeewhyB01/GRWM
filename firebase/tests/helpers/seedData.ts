import {
  PRIVACY_CONSENT_VERSION,
  createDefaultPrivacyConsent,
  storagePaths,
  type AdminAuditLog,
  type AdminUser,
  type AvatarProfile,
  type OutfitRecommendation,
  type PrivacyConsent,
  type StyleProfile,
  type User,
  type UserDeletionRequest,
  type UserProfile,
  type WardrobeItem,
  type WardrobeSetupProfile
} from "@grwm/shared";

import { testDocumentIds, testEmails, testUserIds } from "./ids.ts";

export const seedNowIso = "2026-06-08T00:00:00.000Z";

export interface SeedUserDefinition {
  uid: string;
  email: string;
  displayName: string;
  password: string;
}

export const localSeedUserDefinitions = {
  userA: {
    uid: testUserIds.userA,
    email: testEmails.userA,
    displayName: "Local User A",
    password: "local-user-a-password"
  },
  userB: {
    uid: testUserIds.userB,
    email: testEmails.userB,
    displayName: "Local User B",
    password: "local-user-b-password"
  },
  deletionTestUser: {
    uid: testUserIds.deletionTestUser,
    email: testEmails.deletionTestUser,
    displayName: "Deletion Test User",
    password: "deletion-test-user-password"
  },
  unaffectedUser: {
    uid: testUserIds.unaffectedUser,
    email: testEmails.unaffectedUser,
    displayName: "Unaffected User",
    password: "unaffected-user-password"
  },
  ownerAdmin: {
    uid: testUserIds.ownerAdmin,
    email: testEmails.ownerAdmin,
    displayName: "Local Owner Admin",
    password: "local-owner-admin-password"
  },
  moderatorAdmin: {
    uid: testUserIds.moderatorAdmin,
    email: testEmails.moderatorAdmin,
    displayName: "Local Moderator Admin",
    password: "local-moderator-admin-password"
  }
} satisfies Record<string, SeedUserDefinition>;

export function createSeedUserRecord(seedUser: SeedUserDefinition): User {
  return {
    id: seedUser.uid,
    email: seedUser.email,
    emailVerified: true,
    authProvider: "password",
    disabled: false,
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso,
    lastLoginAtIso: seedNowIso
  };
}

export function createSeedUserProfile(params: {
  id: string;
  userId: string;
  displayName: string;
}): UserProfile {
  return {
    id: params.id,
    userId: params.userId,
    displayName: params.displayName,
    locale: "en",
    countryCode: "GB",
    subscriptionPlanId: "free",
    privacyConsentVersion: PRIVACY_CONSENT_VERSION,
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedPrivacyConsent(params: {
  id: string;
  userId: string;
}): PrivacyConsent {
  return createDefaultPrivacyConsent({
    id: params.id,
    userId: params.userId,
    createdAtIso: seedNowIso
  });
}

export function createSeedStyleProfile(params: {
  userId: string;
}): StyleProfile {
  return {
    id: params.userId,
    userId: params.userId,
    preferredColors: ["blue"],
    avoidedColors: [],
    preferredFits: ["regular"],
    styleKeywords: ["local-test"],
    occasionPriorities: ["everyday"],
    modestyPreference: "",
    weatherLocationPreference: "",
    bodyShapeNotesPrivate: "",
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedAvatarProfile(params: {
  userId: string;
}): AvatarProfile {
  return {
    id: params.userId,
    userId: params.userId,
    status: "not-started",
    consentVersion: PRIVACY_CONSENT_VERSION,
    sourceImageStoragePaths: [],
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedWardrobeItem(params: {
  id: string;
  userId: string;
}): WardrobeItem {
  return {
    id: params.id,
    itemId: params.id,
    userId: params.userId,
    ownerId: params.userId,
    name: "Local test jacket",
    category: "outerwear",
    primaryColour: "navy",
    colorTags: ["navy"],
    seasonTags: ["spring"],
    occasionTags: ["work"],
    storagePath: storagePaths.wardrobeOriginal(params.userId, params.id).path,
    visibility: "private",
    source: "manual",
    uploadStatus: "upload_pending",
    uploadFailureReason: "",
    uploadedAtIso: "",
    uploadFailedAtIso: "",
    analysisStatus: "not_requested",
    analysisConsentVersion: "",
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedWardrobeSetupProfile(params: {
  setupStatus?: WardrobeSetupProfile["setupStatus"];
  userId: string;
}): WardrobeSetupProfile {
  const setupStatus = params.setupStatus ?? "in_progress";

  return {
    id: params.userId,
    userId: params.userId,
    selectedCategories: ["tops", "trousers", "jackets", "shoes"],
    styleBasics: {
      typicalDressCode: "smart_casual",
      preferredOutfitFormality: "balanced",
      favouriteColourFamilies: ["black", "navy", "neutrals"],
      coloursToAvoid: [],
      modestyPreference: "no_preference",
      workwearRelevance: "often",
      occasionwearRelevance: "sometimes"
    },
    setupStatus,
    source: "mobile",
    createdAt: seedNowIso,
    updatedAt: seedNowIso,
    completedAt: setupStatus === "completed" ? seedNowIso : ""
  };
}

export function createSeedOutfitRecommendation(params: {
  id: string;
  userId: string;
}): OutfitRecommendation {
  return {
    id: params.id,
    userId: params.userId,
    wardrobeItemIds: [],
    occasion: "local-test",
    weatherSummary: "No real weather data.",
    recommendationText: "Local emulator placeholder recommendation.",
    status: "placeholder",
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedStorageFile(params: {
  itemId: string;
  userId: string;
}): {
  contentType: "image/jpeg";
  customMetadata: {
    fixture: "grwm-deletion-trigger-test";
  };
  bytes: Uint8Array;
  path: string;
} {
  return {
    bytes: new Uint8Array([71, 82, 87, 77]),
    contentType: "image/jpeg",
    customMetadata: {
      fixture: "grwm-deletion-trigger-test"
    },
    path: storagePaths.wardrobeOriginal(params.userId, params.itemId).path
  };
}

export function createSeedDeletionRequest(params: {
  id: string;
  userId: string;
}): UserDeletionRequest {
  return {
    id: params.id,
    userId: params.userId,
    requestedAtIso: seedNowIso,
    status: "requested",
    processingStartedAtIso: "",
    completedAtIso: "",
    failedAtIso: "",
    failureReason: "",
    requestedBy: "user",
    source: "mobile",
    consentVersionAtRequest: PRIVACY_CONSENT_VERSION,
    auditLogId: ""
  };
}

export function createSeedAdminUser(params: {
  userId: string;
  email: string;
  roles: AdminUser["roles"];
}): AdminUser {
  return {
    id: params.userId,
    userId: params.userId,
    email: params.email,
    roles: params.roles,
    active: true,
    createdAtIso: seedNowIso,
    updatedAtIso: seedNowIso
  };
}

export function createSeedAdminAuditLog(): AdminAuditLog {
  return {
    id: testDocumentIds.adminAuditLog,
    adminUserId: testUserIds.ownerAdmin,
    action: "local-emulator-seed",
    targetCollection: "users",
    targetId: testUserIds.userA,
    createdAtIso: seedNowIso
  };
}

export const localSeedUsers = {
  userA: createSeedUserRecord(localSeedUserDefinitions.userA),
  userB: createSeedUserRecord(localSeedUserDefinitions.userB),
  deletionTestUser: createSeedUserRecord(localSeedUserDefinitions.deletionTestUser),
  unaffectedUser: createSeedUserRecord(localSeedUserDefinitions.unaffectedUser),
  ownerAdmin: createSeedUserRecord(localSeedUserDefinitions.ownerAdmin),
  moderatorAdmin: createSeedUserRecord(localSeedUserDefinitions.moderatorAdmin)
} as const;

export const localSeedAdminUsers = {
  ownerAdmin: createSeedAdminUser({
    userId: testUserIds.ownerAdmin,
    email: testEmails.ownerAdmin,
    roles: ["owner"]
  }),
  moderatorAdmin: createSeedAdminUser({
    userId: testUserIds.moderatorAdmin,
    email: testEmails.moderatorAdmin,
    roles: ["moderator"]
  })
} as const;

export const sampleUserProfile = createSeedUserProfile({
  id: testDocumentIds.userProfileA,
  userId: testUserIds.userA,
  displayName: "Local User A"
});

export const samplePrivacyConsent = createSeedPrivacyConsent({
  id: testDocumentIds.privacyConsentA,
  userId: testUserIds.userA
});

export const sampleWardrobeItem = createSeedWardrobeItem({
  id: testDocumentIds.wardrobeItemA,
  userId: testUserIds.userA
});

export const sampleWardrobeSetupProfile = createSeedWardrobeSetupProfile({
  userId: testUserIds.userA
});

export const sampleDeletionRequest = createSeedDeletionRequest({
  id: testUserIds.userA,
  userId: testUserIds.userA
});
