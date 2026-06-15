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
  WardrobeCategory,
  WardrobeItem
} from "./types";
import { storagePaths } from "./storagePaths.ts";

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
export const WARDROBE_ITEM_ANALYSIS_STATUSES = [
  "not_requested",
  "pending",
  "completed",
  "failed"
] as const;

export interface FieldRule<T> {
  field: keyof T;
  required: boolean;
  kind: "string" | "number" | "boolean" | "string-array";
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
  { field: "userId", required: true, kind: "string" },
  { field: "name", required: true, kind: "string" },
  { field: "category", required: true, kind: "string" },
  { field: "primaryColour", required: true, kind: "string" },
  { field: "colorTags", required: true, kind: "string-array" },
  { field: "seasonTags", required: true, kind: "string-array" },
  { field: "occasionTags", required: true, kind: "string-array" },
  { field: "storagePath", required: true, kind: "string" },
  { field: "visibility", required: true, kind: "string" },
  { field: "source", required: true, kind: "string" },
  { field: "analysisStatus", required: true, kind: "string" },
  { field: "analysisConsentVersion", required: true, kind: "string" },
  { field: "createdAtIso", required: true, kind: "string" },
  { field: "updatedAtIso", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeItem>;

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
  wardrobeItem: wardrobeItemSchema
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

export function isClientWritableWardrobeItem(value: WardrobeItem): boolean {
  return (
    hasRequiredFields(value, wardrobeItemSchema) &&
    value.id.length > 0 &&
    value.userId.length > 0 &&
    value.name.length > 0 &&
    isWardrobeCategory(value.category) &&
    value.primaryColour.length > 0 &&
    value.storagePath === storagePaths.wardrobeOriginal(value.userId, value.id).path &&
    isClientWritableWardrobeVisibility(value.visibility) &&
    isClientWritableWardrobeItemSource(value.source) &&
    value.analysisStatus === "not_requested" &&
    value.analysisConsentVersion === "" &&
    value.createdAtIso.length > 0 &&
    value.updatedAtIso.length > 0
  );
}
