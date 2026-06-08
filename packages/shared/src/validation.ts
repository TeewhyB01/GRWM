import type {
  AvatarProfile,
  OutfitRecommendation,
  StyleProfile,
  SubscriptionPlan,
  UserProfile,
  WardrobeItem
} from "./types";

export interface FieldRule<T> {
  field: keyof T;
  required: boolean;
  kind: "string" | "number" | "boolean" | "string-array";
}

export type ValidationSchema<T> = readonly FieldRule<T>[];

export const userProfileSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "displayName", required: true, kind: "string" },
  { field: "locale", required: true, kind: "string" },
  { field: "countryCode", required: true, kind: "string" },
  { field: "subscriptionPlanId", required: true, kind: "string" },
  { field: "privacyConsentVersion", required: true, kind: "string" }
] satisfies ValidationSchema<UserProfile>;

export const wardrobeItemSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "name", required: true, kind: "string" },
  { field: "category", required: true, kind: "string" },
  { field: "storagePath", required: true, kind: "string" },
  { field: "visibility", required: true, kind: "string" }
] satisfies ValidationSchema<WardrobeItem>;

export const outfitRecommendationSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "userId", required: true, kind: "string" },
  { field: "occasion", required: true, kind: "string" },
  { field: "status", required: true, kind: "string" }
] satisfies ValidationSchema<OutfitRecommendation>;

export const styleProfileSchema = [
  { field: "userId", required: true, kind: "string" },
  { field: "preferredColors", required: true, kind: "string-array" },
  { field: "styleKeywords", required: true, kind: "string-array" }
] satisfies ValidationSchema<StyleProfile>;

export const avatarProfileSchema = [
  { field: "userId", required: true, kind: "string" },
  { field: "status", required: true, kind: "string" },
  { field: "consentVersion", required: true, kind: "string" }
] satisfies ValidationSchema<AvatarProfile>;

export const subscriptionPlanSchema = [
  { field: "id", required: true, kind: "string" },
  { field: "name", required: true, kind: "string" },
  { field: "monthlyPriceMinor", required: true, kind: "number" },
  { field: "currency", required: true, kind: "string" },
  { field: "includesAiRecommendations", required: true, kind: "boolean" },
  { field: "includesAvatarFeatures", required: true, kind: "boolean" }
] satisfies ValidationSchema<SubscriptionPlan>;

export const validationSchemas = {
  avatarProfile: avatarProfileSchema,
  outfitRecommendation: outfitRecommendationSchema,
  styleProfile: styleProfileSchema,
  subscriptionPlan: subscriptionPlanSchema,
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
