export type SupportedLocale = "en";
export type SubscriptionPlanId = "free" | "premium";
export type AdminRole = "owner" | "admin" | "stylist-ops" | "support" | "moderator" | "analyst";
export type WardrobeCategory = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory" | "other";
export type WardrobeVisibility = "private" | "shared-with-stylist";
export type OutfitRecommendationStatus = "placeholder" | "draft" | "ready" | "archived";
export type AvatarProfileStatus = "not-started" | "requested" | "processing" | "ready" | "failed";

export interface UserProfile {
  id: string;
  displayName: string;
  locale: SupportedLocale;
  countryCode: string;
  subscriptionPlanId: SubscriptionPlanId;
  privacyConsentVersion: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface StyleProfile {
  userId: string;
  preferredColors: readonly string[];
  avoidedColors: readonly string[];
  preferredFits: readonly string[];
  styleKeywords: readonly string[];
  occasionPriorities: readonly string[];
  bodyShapeNotesPrivate: string;
  updatedAtIso: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: WardrobeCategory;
  colorTags: readonly string[];
  seasonTags: readonly string[];
  occasionTags: readonly string[];
  storagePath: string;
  visibility: WardrobeVisibility;
  createdAtIso: string;
  updatedAtIso: string;
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
}

export interface AvatarProfile {
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

export type GrwmUserProfile = UserProfile;
export type PlanTier = SubscriptionPlanId;
