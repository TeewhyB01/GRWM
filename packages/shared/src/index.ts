export const DEFAULT_LOCALE = "en";

export const PRIVACY_FIRST_PRODUCT_PRINCIPLE =
  "Collect only what is needed to style the user.";

export const FIREBASE_SERVICES = [
  "authentication",
  "cloud-firestore",
  "storage",
  "cloud-functions"
] as const;

export type FirebaseService = (typeof FIREBASE_SERVICES)[number];

export interface WardrobeImagePolicy {
  storageProvider: "firebase-storage";
  requiresAuthenticatedOwner: true;
  allowPublicAccess: false;
}

export type {
  AdminAuditLog,
  AdminRole,
  AdminUser,
  AuthProvider,
  AvatarProfile,
  AvatarProfileStatus,
  GrwmUserProfile,
  OutfitRecommendation,
  OutfitRecommendationStatus,
  PlanTier,
  PrivacyConsent,
  PrivacyConsentPurpose,
  PrivacyConsentSource,
  StyleProfile,
  SubscriptionPlan,
  SubscriptionPlanId,
  SupportedLocale,
  User,
  UserDeletionRequestRequestedBy,
  UserDeletionRequestSource,
  UserDeletionRequest,
  UserDeletionRequestStatus,
  UserProfile,
  WardrobeCategory,
  WardrobeItem,
  WardrobeVisibility
} from "./types.ts";

export {
  ADMIN_ROLES,
  canAccessAdminConsole,
  hasAdminRole,
  isAdminRole
} from "./admin.ts";

export {
  firestoreCollections,
  futureUserOwnedFirestoreCollections,
  userOwnedCollectionNames,
  userScopedDocumentPath
} from "./firestore.ts";

export type {
  FirestoreCollectionKey,
  FirestoreCollectionName,
  FutureUserOwnedFirestoreCollection
} from "./firestore.ts";

export {
  PRIVACY_CONSENT_PURPOSES,
  PRIVACY_CONSENT_VERSION,
  createDefaultPrivacyConsent,
  privacyConsentCopy
} from "./privacy.ts";

export {
  storagePaths
} from "./storagePaths.ts";

export type {
  StoragePathDefinition,
  StoragePathKind
} from "./storagePaths.ts";

export {
  adminAuditLogSchema,
  adminUserSchema,
  avatarProfileSchema,
  hasRequiredFields,
  isSubscriptionPlanId,
  outfitRecommendationSchema,
  privacyConsentSchema,
  styleProfileSchema,
  subscriptionPlanSchema,
  userDeletionRequestSchema,
  userProfileSchema,
  userSchema,
  validationSchemas,
  wardrobeItemSchema
} from "./validation.ts";

export type { FieldRule, ValidationSchema } from "./validation.ts";
