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
  WardrobeItemAnalysisStatus,
  WardrobeCategory,
  WardrobeItem,
  WardrobeItemSource,
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
  ALLOWED_AVATAR_SOURCE_CONTENT_TYPES,
  ALLOWED_STYLE_PHOTO_CONTENT_TYPES,
  ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES,
  BYTES_PER_MEBIBYTE,
  MAX_AVATAR_GENERATED_IMAGE_BYTES,
  MAX_AVATAR_SOURCE_IMAGE_BYTES,
  MAX_OUTFIT_IMAGE_BYTES,
  MAX_STYLE_PHOTO_IMAGE_BYTES,
  MAX_WARDROBE_IMAGE_BYTES,
  STORAGE_UPLOAD_CATEGORIES,
  isAllowedAvatarSourceContentType,
  isAllowedStylePhotoContentType,
  isAllowedWardrobeImageContentType,
  isStorageUploadCategory
} from "./uploadPolicy.ts";

export type {
  AvatarSourceContentType,
  StorageUploadCategory,
  StylePhotoContentType,
  WardrobeImageContentType
} from "./uploadPolicy.ts";

export {
  canCreateAvatar,
  canRequestWardrobePhotoAnalysis,
  canUploadWardrobePhoto,
  canUseLocationWeather
} from "./consentGates.ts";

export type {
  ConsentGateInput
} from "./consentGates.ts";

export {
  assertSafeStoragePathSegment,
  isSafeStoragePathSegment,
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
  CLIENT_WRITABLE_WARDROBE_ITEM_SOURCES,
  CLIENT_WRITABLE_WARDROBE_VISIBILITIES,
  hasRequiredFields,
  isClientWritableWardrobeItem,
  isClientWritableWardrobeItemSource,
  isClientWritableWardrobeVisibility,
  isSubscriptionPlanId,
  isWardrobeCategory,
  isWardrobeItemAnalysisStatus,
  isWardrobeItemSource,
  isWardrobeVisibility,
  outfitRecommendationSchema,
  privacyConsentSchema,
  styleProfileSchema,
  subscriptionPlanSchema,
  userDeletionRequestSchema,
  userProfileSchema,
  userSchema,
  validationSchemas,
  WARDROBE_CATEGORIES,
  WARDROBE_ITEM_ANALYSIS_STATUSES,
  WARDROBE_ITEM_SOURCES,
  WARDROBE_VISIBILITIES,
  wardrobeItemSchema
} from "./validation.ts";

export type { FieldRule, ValidationSchema } from "./validation.ts";
