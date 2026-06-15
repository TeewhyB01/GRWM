import type {
  AdminAuditLog,
  AdminUser,
  AvatarProfile,
  OutfitRecommendation,
  PrivacyConsent,
  StyleProfile,
  SubscriptionPlan,
  User,
  UserDeletionRequest,
  UserProfile,
  WardrobeAnalysisRequestPayload,
  WardrobeAnalysisStatus,
  WardrobeCategoryPreference,
  WardrobeColourFamily,
  WardrobeCategory,
  WardrobeItem,
  WardrobeModestyPreference,
  WardrobeOutfitFormality,
  WardrobeSetupProfile,
  WardrobeSetupRelevance,
  WardrobeSetupSource,
  WardrobeSetupStatus,
  WardrobeStyleBasics,
  WardrobeTypicalDressCode,
  WardrobeUploadFailureReason,
  WardrobeUploadFinalisationResult,
  WardrobeUploadMetadata,
  WardrobeUploadStatus
} from "./types";
import { storagePaths } from "./storagePaths.ts";
import {
  isAllowedWardrobeImageContentType,
  MAX_WARDROBE_IMAGE_BYTES
} from "./uploadPolicy.ts";

export const WARDROBE_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "accessory",
  "other"
] as const satisfies readonly WardrobeCategory[];

export const WARDROBE_VISIBILITIES = ["private", "shared-with-stylist"] as const;
export const CLIENT_WRITABLE_WARDROBE_VISIBILITIES = ["private"] as const;
export const WARDROBE_ITEM_SOURCES = ["manual", "import", "future_ai"] as const;
export const CLIENT_WRITABLE_WARDROBE_ITEM_SOURCES = ["manual", "import"] as const;
export const WARDROBE_UPLOAD_STATUSES = [
  "draft",
  "upload_pending",
  "uploaded",
  "upload_failed",
  "deleted"
] as const satisfies readonly WardrobeUploadStatus[];
export const CLIENT_CREATABLE_WARDROBE_UPLOAD_STATUSES = [
  "draft",
  "upload_pending"
] as const satisfies readonly WardrobeUploadStatus[];
export const WARDROBE_ANALYSIS_STATUSES = [
  "not_requested",
  "blocked_missing_consent",
  "pending",
  "completed",
  "failed"
] as const satisfies readonly WardrobeAnalysisStatus[];
export const WARDROBE_ITEM_ANALYSIS_STATUSES = WARDROBE_ANALYSIS_STATUSES;
export const WARDROBE_SETUP_STATUSES = [
  "not_started",
  "in_progress",
  "completed"
] as const satisfies readonly WardrobeSetupStatus[];
export const WARDROBE_SETUP_SOURCES = ["mobile"] as const satisfies readonly WardrobeSetupSource[];
export const WARDROBE_CATEGORY_PREFERENCES = [
  "tops",
  "trousers",
  "jeans",
  "skirts",
  "dresses",
  "jackets",
  "coats",
  "blazers",
  "shoes",
  "bags",
  "jewellery",
  "belts",
  "scarves",
  "hats",
  "activewear",
  "workwear",
  "occasion_wear",
  "traditional_cultural_clothing"
] as const satisfies readonly WardrobeCategoryPreference[];
export const WARDROBE_TYPICAL_DRESS_CODES = [
  "casual",
  "smart_casual",
  "business_casual",
  "formal",
  "varied"
] as const satisfies readonly WardrobeTypicalDressCode[];
export const WARDROBE_OUTFIT_FORMALITIES = [
  "relaxed",
  "balanced",
  "polished",
  "formal"
] as const satisfies readonly WardrobeOutfitFormality[];
export const WARDROBE_COLOUR_FAMILIES = [
  "black",
  "white",
  "grey",
  "navy",
  "blue",
  "green",
  "red",
  "pink",
  "purple",
  "yellow",
  "orange",
  "brown",
  "cream",
  "metallics",
  "pastels",
  "brights",
  "neutrals"
] as const satisfies readonly WardrobeColourFamily[];
export const WARDROBE_MODESTY_PREFERENCES = [
  "no_preference",
  "more_coverage",
  "high_coverage",
  "varies"
] as const satisfies readonly WardrobeModestyPreference[];
export const WARDROBE_SETUP_RELEVANCE_VALUES = [
  "not_relevant",
  "sometimes",
  "often"
] as const satisfies readonly WardrobeSetupRelevance[];
export const WARDROBE_UPLOAD_FAILURE_REASONS = [
  "invalid_storage_path",
  "missing_required_metadata",
  "metadata_mismatch",
  "invalid_content_type",
  "file_too_large",
  "missing_wardrobe_item",
  "user_mismatch",
  "storage_path_mismatch",
  "already_deleted",
  "write_failed",
  "unknown"
] as const satisfies readonly WardrobeUploadFailureReason[];
export const WARDROBE_ITEM_USER_EDITABLE_FIELDS = [
  "name",
  "category",
  "primaryColour",
  "colorTags",
  "seasonTags",
  "occasionTags",
  "visibility",
  "updatedAtIso"
] as const satisfies readonly (keyof WardrobeItem)[];

export interface FieldRule<T> {
  field: keyof T;
  required: boolean;
  kind: "string" | "number" | "boolean" | "string-array" | "object";
}

export type ValidationSchema<T> = readonly FieldRule<T>[];

export const userSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "email", required: true, kind: "string" },
  { field: "emailVerified", required: true, kind: "boolean" },
  { field: "authProvider", required: true, kind: "string" },
  { field: "disabled", required: true, kind: "boolean" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" },
  { field: "lastLoginAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<User>;

export const userProfileSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "displayName", required: true, kind: "string" },
  { field: "locale", required: true, kind: "string" },
  { field: "countryCode", required: true, kind: "string" },
  { field: "subscriptionPlanId", required: true, kind: "string" },
  { field: "privacyConsentVersion", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<UserProfile>;

export const privacyConsentSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "version", required: true, kind: "string" },
  { field: "source", required: true, kind: "string" },
  { field: "wardrobePhotoAnalysis", required: true, kind: "boolean" },
  { field: "stylePhotoAnalysis", required: true, kind: "boolean" },
  { field: "avatarCreation", required: true, kind: "boolean" },
  { field: "locationWeatherUse", required: true, kind: "boolean" },
  { field: "aiRecommendationUse", required: true, kind: "boolean" },
  { field: "marketingEmails", required: true, kind: "boolean" },
  { field: "analytics", required: true, kind: "boolean" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<PrivacyConsent>;

export const wardrobeItemSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "itemId", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "ownerId", required: true, kind: "string" },
  { field: "name", required: true, kind: "string" },
  { field: "category", required: true, kind: "string" },
  { field: "primaryColour", required: true, kind: "string" },
  { field: "colorTags", required: true, kind: "string-array" },
  { field: "seasonTags", required: true, kind: "string-array" },
  { field: "occasionTags", required: true, kind: "string-array" },
  { field: "storagePath", required: true, kind: "string" },
  { field: "visibility", required: true, kind: "string" },
  { field: "source", required: true, kind: "string" },
  { field: "uploadStatus", required: true, kind: "string" },
  { field: "uploadFailureReason", required: true, kind: "string" },
  { field: "uploadedAtIso", required: true, kind: "string" },
  { field: "uploadFailedAtIso", required: true, kind: "string" },
  { field: "analysisStatus", required: true, kind: "string" },
  { field: "analysisConsentVersion", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeItem>;

export const wardrobeUploadMetadataSchema = [
  { field: "ownerId", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "itemId", required: true, kind: "string" },
  { field: "uploadCategory", required: true, kind: "string" },
  { field: "consentVersion", required: true, kind: "string" },
  { field: "storagePath", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeUploadMetadata>;

export const wardrobeStyleBasicsSchema = [
  { field: "typicalDressCode", required: true, kind: "string" },
  { field: "preferredOutfitFormality", required: true, kind: "string" },
  { field: "favouriteColourFamilies", required: true, kind: "string-array" },
  { field: "coloursToAvoid", required: true, kind: "string-array" },
  { field: "modestyPreference", required: true, kind: "string" },
  { field: "workwearRelevance", required: true, kind: "string" },
  { field: "occasionwearRelevance", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeStyleBasics>;

export const wardrobeSetupProfileSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "selectedCategories", required: true, kind: "string-array" },
  { field: "styleBasics", required: true, kind: "object" },
  { field: "setupStatus", required: true, kind: "string" },
  { field: "source", required: true, kind: "string" },
  { field: "createdAt", required: true, kind: "string" },
  { field: "updatedAt", required: true, kind: "string" },
  { field: "completedAt", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeSetupProfile>;

export const wardrobeUploadFinalisationResultSchema = [
  { field: "ok", required: true, kind: "boolean" },
  { field: "userId", required: true, kind: "string" },
  { field: "itemId", required: true, kind: "string" },
  { field: "storagePath", required: true, kind: "string" },
  { field: "uploadStatus", required: true, kind: "string" },
  { field: "failureReason", required: true, kind: "string" },
  { field: "analysisStatus", required: true, kind: "string" },
  { field: "auditLogId", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeUploadFinalisationResult>;

export const wardrobeAnalysisRequestPayloadSchema = [
  { field: "userId", required: true, kind: "string" },
  { field: "ownerId", required: true, kind: "string" },
  { field: "itemId", required: true, kind: "string" },
  { field: "requestedAtIso", required: true, kind: "string" },
  { field: "consentVersion", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeAnalysisRequestPayload>;

export const outfitRecommendationSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "wardrobeItemIds", required: true, kind: "string-array" },
  { field: "occasion", required: true, kind: "string" },
  { field: "weatherSummary", required: true, kind: "string" },
  { field: "recommendationText", required: true, kind: "string" },
  { field: "status", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<OutfitRecommendation>;

export const styleProfileSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "preferredColors", required: true, kind: "string-array" },
  { field: "avoidedColors", required: true, kind: "string-array" },
  { field: "preferredFits", required: true, kind: "string-array" },
  { field: "styleKeywords", required: true, kind: "string-array" },
  { field: "occasionPriorities", required: true, kind: "string-array" },
  { field: "modestyPreference", required: true, kind: "string" },
  { field: "weatherLocationPreference", required: true, kind: "string" },
  { field: "bodyShapeNotesPrivate", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<StyleProfile>;

export const avatarProfileSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "status", required: true, kind: "string" },
  { field: "consentVersion", required: true, kind: "string" },
  { field: "sourceImageStoragePaths", required: true, kind: "string-array" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<AvatarProfile>;

export const subscriptionPlanSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "name", required: true, kind: "string" },
  { field: "monthlyPriceMinor", required: true, kind: "number" },
  { field: "currency", required: true, kind: "string" },
  { field: "includesAiRecommendations", required: true, kind: "boolean" },
  { field: "includesAvatarFeatures", required: true, kind: "boolean" }
] satisfies ValidationSchema<SubscriptionPlan>;

export const adminUserSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "email", required: true, kind: "string" },
  { field: "roles", required: true, kind: "string-array" },
  { field: "active", required: true, kind: "boolean" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<AdminUser>;

export const adminAuditLogSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "adminUserId", required: true, kind: "string" },
  { field: "action", required: true, kind: "string" },
  { field: "targetCollection", required: true, kind: "string" },
  { field: "targetId", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<AdminAuditLog>;

export const userDeletionRequestSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "requestedAtIso", required: true, kind: "string" },
  { field: "status", required: true, kind: "string" },
  { field: "processingStartedAtIso", required: true, kind: "string" },
  { field: "completedAtIso", required: true, kind: "string" },
  { field: "failedAtIso", required: true, kind: "string" },
  { field: "failureReason", required: true, kind: "string" },
  { field: "requestedBy", required: true, kind: "string" },
  { field: "source", required: true, kind: "string" },
  { field: "consentVersionAtRequest", required: true, kind: "string" },
  { field: "auditLogId", required: true, kind: "string" }
] satisfies ValidationSchema<UserDeletionRequest>;

export const validationSchemas = {
  adminAuditLog: adminAuditLogSchema,
  adminUser: adminUserSchema,
  avatarProfile: avatarProfileSchema,
  outfitRecommendation: outfitRecommendationSchema,
  privacyConsent: privacyConsentSchema,
  styleProfile: styleProfileSchema,
  subscriptionPlan: subscriptionPlanSchema,
  user: userSchema,
  userDeletionRequest: userDeletionRequestSchema,
  userProfile: userProfileSchema,
  wardrobeAnalysisRequestPayload: wardrobeAnalysisRequestPayloadSchema,
  wardrobeItem: wardrobeItemSchema,
  wardrobeSetupProfile: wardrobeSetupProfileSchema,
  wardrobeStyleBasics: wardrobeStyleBasicsSchema,
  wardrobeUploadFinalisationResult: wardrobeUploadFinalisationResultSchema,
  wardrobeUploadMetadata: wardrobeUploadMetadataSchema
} as const;

export function hasRequiredFields<T extends object>(
  value: Partial<T>,
  schema: ValidationSchema<T>
): boolean {
  return schema.every((rule) => {
    if (!rule.required) {
      return true;
    }

    const fieldValue = value[rule.field];

    if (rule.kind === "string-array") {
      return Array.isArray(fieldValue) && fieldValue.every((item) => typeof item === "string");
    }

    if (rule.kind === "object") {
      return isStringRecord(fieldValue);
    }

    return typeof fieldValue === rule.kind;
  });
}

export function isSubscriptionPlanId(value: string): value is SubscriptionPlan["id"] {
  return value === "free" || value === "premium";
}

export function isWardrobeCategory(value: string): value is WardrobeItem["category"] {
  return WARDROBE_CATEGORIES.includes(value as WardrobeItem["category"]);
}

export function isWardrobeVisibility(value: string): value is WardrobeItem["visibility"] {
  return WARDROBE_VISIBILITIES.includes(value as WardrobeItem["visibility"]);
}

export function isClientWritableWardrobeVisibility(value: string): boolean {
  return CLIENT_WRITABLE_WARDROBE_VISIBILITIES.includes(
    value as (typeof CLIENT_WRITABLE_WARDROBE_VISIBILITIES)[number]
  );
}

export function isWardrobeItemSource(value: string): value is WardrobeItem["source"] {
  return WARDROBE_ITEM_SOURCES.includes(value as WardrobeItem["source"]);
}

export function isClientWritableWardrobeItemSource(value: string): boolean {
  return CLIENT_WRITABLE_WARDROBE_ITEM_SOURCES.includes(
    value as (typeof CLIENT_WRITABLE_WARDROBE_ITEM_SOURCES)[number]
  );
}

export function isWardrobeItemAnalysisStatus(
  value: string
): value is WardrobeItem["analysisStatus"] {
  return WARDROBE_ITEM_ANALYSIS_STATUSES.includes(value as WardrobeItem["analysisStatus"]);
}

export function isWardrobeSetupStatus(value: string): value is WardrobeSetupStatus {
  return WARDROBE_SETUP_STATUSES.includes(value as WardrobeSetupStatus);
}

export function isWardrobeSetupSource(value: string): value is WardrobeSetupSource {
  return WARDROBE_SETUP_SOURCES.includes(value as WardrobeSetupSource);
}

export function isWardrobeCategoryPreference(value: string): value is WardrobeCategoryPreference {
  return WARDROBE_CATEGORY_PREFERENCES.includes(value as WardrobeCategoryPreference);
}

export function isWardrobeTypicalDressCode(value: string): value is WardrobeTypicalDressCode {
  return WARDROBE_TYPICAL_DRESS_CODES.includes(value as WardrobeTypicalDressCode);
}

export function isWardrobeOutfitFormality(value: string): value is WardrobeOutfitFormality {
  return WARDROBE_OUTFIT_FORMALITIES.includes(value as WardrobeOutfitFormality);
}

export function isWardrobeColourFamily(value: string): value is WardrobeColourFamily {
  return WARDROBE_COLOUR_FAMILIES.includes(value as WardrobeColourFamily);
}

export function isWardrobeModestyPreference(value: string): value is WardrobeModestyPreference {
  return WARDROBE_MODESTY_PREFERENCES.includes(value as WardrobeModestyPreference);
}

export function isWardrobeSetupRelevance(value: string): value is WardrobeSetupRelevance {
  return WARDROBE_SETUP_RELEVANCE_VALUES.includes(value as WardrobeSetupRelevance);
}

export function isWardrobeAnalysisStatus(value: string): value is WardrobeAnalysisStatus {
  return WARDROBE_ANALYSIS_STATUSES.includes(value as WardrobeAnalysisStatus);
}

export function isWardrobeUploadStatus(value: string): value is WardrobeUploadStatus {
  return WARDROBE_UPLOAD_STATUSES.includes(value as WardrobeUploadStatus);
}

export function isClientCreatableWardrobeUploadStatus(value: string): boolean {
  return CLIENT_CREATABLE_WARDROBE_UPLOAD_STATUSES.includes(
    value as (typeof CLIENT_CREATABLE_WARDROBE_UPLOAD_STATUSES)[number]
  );
}

export function isWardrobeUploadFailureReason(
  value: string
): value is WardrobeUploadFailureReason {
  return WARDROBE_UPLOAD_FAILURE_REASONS.includes(value as WardrobeUploadFailureReason);
}

export function isSafeWardrobeLifecycleId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function expectedWardrobeStoragePath(userId: string, itemId: string): string | null {
  try {
    return storagePaths.wardrobeOriginal(userId, itemId).path;
  } catch {
    return null;
  }
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function isTagList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length <= 30 && value.every((item) => typeof item === "string");
}

function isStringListFromAllowedValues(
  value: unknown,
  allowedValues: readonly string[],
  maxItems: number
): boolean {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every((item) => typeof item === "string" && allowedValues.includes(item))
  );
}

function isOptionalEnumValue(
  value: unknown,
  validator: (candidate: string) => boolean
): boolean {
  return typeof value === "string" && (value === "" || validator(value));
}

export function isWardrobeStyleBasics(value: unknown): value is WardrobeStyleBasics {
  if (!isStringRecord(value) || !hasRequiredFields(value, wardrobeStyleBasicsSchema)) {
    return false;
  }

  return (
    isOptionalEnumValue(value.typicalDressCode, isWardrobeTypicalDressCode) &&
    isOptionalEnumValue(value.preferredOutfitFormality, isWardrobeOutfitFormality) &&
    isStringListFromAllowedValues(value.favouriteColourFamilies, WARDROBE_COLOUR_FAMILIES, 30) &&
    isStringListFromAllowedValues(value.coloursToAvoid, WARDROBE_COLOUR_FAMILIES, 30) &&
    isOptionalEnumValue(value.modestyPreference, isWardrobeModestyPreference) &&
    typeof value.workwearRelevance === "string" &&
    isWardrobeSetupRelevance(value.workwearRelevance) &&
    typeof value.occasionwearRelevance === "string" &&
    isWardrobeSetupRelevance(value.occasionwearRelevance)
  );
}

export function isWardrobeSetupProfile(value: unknown): value is WardrobeSetupProfile {
  if (!isStringRecord(value) || !hasRequiredFields(value, wardrobeSetupProfileSchema)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    isSafeWardrobeLifecycleId(value.id) &&
    isSafeWardrobeLifecycleId(value.userId) &&
    value.id === value.userId &&
    isStringListFromAllowedValues(value.selectedCategories, WARDROBE_CATEGORY_PREFERENCES, 18) &&
    isWardrobeStyleBasics(value.styleBasics) &&
    typeof value.setupStatus === "string" &&
    isWardrobeSetupStatus(value.setupStatus) &&
    typeof value.source === "string" &&
    isWardrobeSetupSource(value.source) &&
    typeof value.createdAt === "string" &&
    value.createdAt.length > 0 &&
    typeof value.updatedAt === "string" &&
    value.updatedAt.length > 0 &&
    typeof value.completedAt === "string" &&
    (value.setupStatus === "completed" ? value.completedAt.length > 0 : true)
  );
}

export function isExpectedWardrobeUploadStoragePath(params: {
  itemId: string;
  storagePath: string;
  userId: string;
}): boolean {
  return expectedWardrobeStoragePath(params.userId, params.itemId) === params.storagePath;
}

export function isValidWardrobeUploadMetadata(metadata: WardrobeUploadMetadata): boolean {
  return (
    hasRequiredFields(metadata, wardrobeUploadMetadataSchema) &&
    isSafeWardrobeLifecycleId(metadata.userId) &&
    isSafeWardrobeLifecycleId(metadata.ownerId) &&
    isSafeWardrobeLifecycleId(metadata.itemId) &&
    metadata.ownerId === metadata.userId &&
    metadata.uploadCategory === "wardrobe-original" &&
    metadata.consentVersion.length > 0 &&
    isExpectedWardrobeUploadStoragePath({
      itemId: metadata.itemId,
      storagePath: metadata.storagePath,
      userId: metadata.userId
    })
  );
}

export function isValidWardrobeUploadObjectPolicy(params: {
  contentType: string;
  sizeBytes: number;
}): boolean {
  return (
    isAllowedWardrobeImageContentType(params.contentType) &&
    Number.isSafeInteger(params.sizeBytes) &&
    params.sizeBytes >= 0 &&
    params.sizeBytes <= MAX_WARDROBE_IMAGE_BYTES
  );
}

export function isWardrobeUploadDraft(value: WardrobeItem): boolean {
  return isClientWritableWardrobeItem(value);
}

export function isClientWritableWardrobeItem(value: WardrobeItem): boolean {
  const expectedPath = expectedWardrobeStoragePath(value.userId, value.itemId);

  return (
    hasRequiredFields(value, wardrobeItemSchema) &&
    isSafeWardrobeLifecycleId(value.id) &&
    isSafeWardrobeLifecycleId(value.itemId) &&
    isSafeWardrobeLifecycleId(value.userId) &&
    isSafeWardrobeLifecycleId(value.ownerId) &&
    value.id === value.itemId &&
    value.ownerId === value.userId &&
    value.name.length > 0 &&
    isWardrobeCategory(value.category) &&
    value.primaryColour.length > 0 &&
    value.storagePath === expectedPath &&
    isClientWritableWardrobeVisibility(value.visibility) &&
    isClientWritableWardrobeItemSource(value.source) &&
    isClientCreatableWardrobeUploadStatus(value.uploadStatus) &&
    value.uploadFailureReason === "" &&
    value.uploadedAtIso === "" &&
    value.uploadFailedAtIso === "" &&
    value.analysisStatus === "not_requested" &&
    value.analysisConsentVersion === "" &&
    value.createdAtIso.length > 0 &&
    value.updatedAtIso.length > 0
  );
}

export function isWardrobeItemUserEditableUpdatePayload(value: unknown): boolean {
  if (!isStringRecord(value) || !hasOnlyKeys(value, WARDROBE_ITEM_USER_EDITABLE_FIELDS)) {
    return false;
  }

  if ("name" in value && (typeof value.name !== "string" || value.name.length === 0)) {
    return false;
  }

  if ("category" in value && (typeof value.category !== "string" || !isWardrobeCategory(value.category))) {
    return false;
  }

  if ("primaryColour" in value && (typeof value.primaryColour !== "string" || value.primaryColour.length === 0)) {
    return false;
  }

  if ("colorTags" in value && !isTagList(value.colorTags)) {
    return false;
  }

  if ("seasonTags" in value && !isTagList(value.seasonTags)) {
    return false;
  }

  if ("occasionTags" in value && !isTagList(value.occasionTags)) {
    return false;
  }

  if (
    "visibility" in value &&
    (typeof value.visibility !== "string" || !isClientWritableWardrobeVisibility(value.visibility))
  ) {
    return false;
  }

  if ("updatedAtIso" in value && (typeof value.updatedAtIso !== "string" || value.updatedAtIso.length === 0)) {
    return false;
  }

  return true;
}

export function isValidWardrobeUploadFinalisationResult(
  result: WardrobeUploadFinalisationResult
): boolean {
  return (
    hasRequiredFields(result, wardrobeUploadFinalisationResultSchema) &&
    isSafeWardrobeLifecycleId(result.userId) &&
    isSafeWardrobeLifecycleId(result.itemId) &&
    isExpectedWardrobeUploadStoragePath({
      itemId: result.itemId,
      storagePath: result.storagePath,
      userId: result.userId
    }) &&
    (result.uploadStatus === "uploaded" || result.uploadStatus === "upload_failed") &&
    (result.failureReason === "" || isWardrobeUploadFailureReason(result.failureReason)) &&
    isWardrobeAnalysisStatus(result.analysisStatus)
  );
}

export function isWardrobeAnalysisRequestPayload(
  payload: WardrobeAnalysisRequestPayload
): boolean {
  return (
    hasRequiredFields(payload, wardrobeAnalysisRequestPayloadSchema) &&
    isSafeWardrobeLifecycleId(payload.userId) &&
    isSafeWardrobeLifecycleId(payload.ownerId) &&
    isSafeWardrobeLifecycleId(payload.itemId) &&
    payload.userId === payload.ownerId &&
    payload.requestedAtIso.length > 0 &&
    payload.consentVersion.length > 0
  );
}
