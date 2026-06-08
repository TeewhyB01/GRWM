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
  AdminRole,
  AvatarProfile,
  AvatarProfileStatus,
  GrwmUserProfile,
  OutfitRecommendation,
  OutfitRecommendationStatus,
  PlanTier,
  StyleProfile,
  SubscriptionPlan,
  SubscriptionPlanId,
  SupportedLocale,
  UserProfile,
  WardrobeCategory,
  WardrobeItem,
  WardrobeVisibility
} from "./types.ts";

export {
  avatarProfileSchema,
  hasRequiredFields,
  isSubscriptionPlanId,
  outfitRecommendationSchema,
  styleProfileSchema,
  subscriptionPlanSchema,
  userProfileSchema,
  validationSchemas,
  wardrobeItemSchema
} from "./validation.ts";

export type { FieldRule, ValidationSchema } from "./validation.ts";
