export type SupportedLocale = "en";
export type SubscriptionPlanId = "free" | "premium";
export type AdminRole = "owner" | "admin" | "moderator" | "support" | "analyst";
export type WardrobeCategory = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory" | "other";
export type WardrobeVisibility = "private" | "shared-with-stylist";
export type WardrobeItemSource = "manual" | "import" | "future_ai";
export type WardrobeUploadStatus = "draft" | "upload_pending" | "uploaded" | "upload_failed" | "deleted";
export type WardrobeAnalysisStatus =
  | "not_requested"
  | "blocked_missing_consent"
  | "pending"
  | "completed"
  | "failed";
export type WardrobeItemAnalysisStatus = WardrobeAnalysisStatus;
export type WardrobeUploadFailureReason =
  | "invalid_storage_path"
  | "missing_required_metadata"
  | "metadata_mismatch"
  | "invalid_content_type"
  | "file_too_large"
  | "missing_wardrobe_item"
  | "user_mismatch"
  | "storage_path_mismatch"
  | "already_deleted"
  | "write_failed"
  | "unknown";
export type OutfitRecommendationStatus = "placeholder" | "draft" | "ready" | "archived";
export type AvatarProfileStatus = "not-started" | "requested" | "processing" | "ready" | "failed";
export type AuthProvider = "password";
export type PrivacyConsentSource = "mobile";
export type PrivacyConsentPurpose =
  | "wardrobePhotoAnalysis"
  | "stylePhotoAnalysis"
  | "avatarCreation"
  | "locationWeatherUse"
  | "aiRecommendationUse"
  | "marketingEmails"
  | "analytics";
export type UserDeletionRequestStatus = "requested" | "processing" | "completed" | "failed" | "cancelled";
export type UserDeletionRequestRequestedBy = "user" | "admin";
export type UserDeletionRequestSource = "mobile" | "admin" | "function";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  authProvider: AuthProvider;
  disabled: boolean;
  createdAtIso: string;
  updatedAtIso: string;
  lastLoginAtIso: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  locale: SupportedLocale;
  countryCode: string;
  subscriptionPlanId: SubscriptionPlanId;
  privacyConsentVersion: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface PrivacyConsent {
  id: string;
  userId: string;
  version: string;
  source: PrivacyConsentSource;
  wardrobePhotoAnalysis: boolean;
  stylePhotoAnalysis: boolean;
  avatarCreation: boolean;
  locationWeatherUse: boolean;
  aiRecommendationUse: boolean;
  marketingEmails: boolean;
  analytics: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface StyleProfile {
  id: string;
  userId: string;
  preferredColors: readonly string[];
  avoidedColors: readonly string[];
  preferredFits: readonly string[];
  styleKeywords: readonly string[];
  occasionPriorities: readonly string[];
  modestyPreference: string;
  weatherLocationPreference: string;
  bodyShapeNotesPrivate: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface WardrobeItem {
  id: string;
  itemId: string;
  userId: string;
  ownerId: string;
  name: string;
  category: WardrobeCategory;
  primaryColour: string;
  colorTags: readonly string[];
  seasonTags: readonly string[];
  occasionTags: readonly string[];
  storagePath: string;
  visibility: WardrobeVisibility;
  source: WardrobeItemSource;
  uploadStatus: WardrobeUploadStatus;
  uploadFailureReason: WardrobeUploadFailureReason | "";
  uploadedAtIso: string;
  uploadFailedAtIso: string;
  analysisStatus: WardrobeItemAnalysisStatus;
  analysisConsentVersion: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface WardrobeUploadMetadata {
  ownerId: string;
  userId: string;
  itemId: string;
  uploadCategory: "wardrobe-original";
  consentVersion: string;
  storagePath: string;
}

export interface WardrobeUploadDraft extends WardrobeItem {
  uploadStatus: "draft" | "upload_pending";
  uploadFailureReason: "";
  uploadedAtIso: "";
  uploadFailedAtIso: "";
  analysisStatus: "not_requested";
  analysisConsentVersion: "";
}

export interface WardrobeUploadFinalisationResult {
  ok: boolean;
  userId: string;
  itemId: string;
  storagePath: string;
  uploadStatus: "uploaded" | "upload_failed";
  failureReason: WardrobeUploadFailureReason | "";
  analysisStatus: WardrobeAnalysisStatus;
  auditLogId: string;
}

export interface WardrobeAnalysisRequestPayload {
  userId: string;
  ownerId: string;
  itemId: string;
  requestedAtIso: string;
  consentVersion: string;
}

export interface OutfitRecommendation {
  id: string;
  userId: string;
  wardrobeItemIds: readonly string[];
  occasion: string;
  weatherSummary: string;
  recommendationText: string;
  status: OutfitRecommendationStatus;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface AvatarProfile {
  id: string;
  userId: string;
  status: AvatarProfileStatus;
  consentVersion: string;
  sourceImageStoragePaths: readonly string[];
  createdAtIso: string;
  updatedAtIso: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  monthlyPriceMinor: number;
  currency: string;
  includesAiRecommendations: boolean;
  includesAvatarFeatures: boolean;
}

export interface AdminUser {
  id: string;
  userId: string;
  email: string;
  roles: readonly AdminRole[];
  active: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  targetCollection: string;
  targetId: string;
  createdAtIso: string;
}

export interface UserDeletionRequest {
  id: string;
  userId: string;
  requestedAtIso: string;
  status: UserDeletionRequestStatus;
  processingStartedAtIso: string;
  completedAtIso: string;
  failedAtIso: string;
  failureReason: string;
  requestedBy: UserDeletionRequestRequestedBy;
  source: UserDeletionRequestSource;
  consentVersionAtRequest: string;
  auditLogId: string;
}

export type GrwmUserProfile = UserProfile;
export type PlanTier = SubscriptionPlanId;
