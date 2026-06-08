export const DEFAULT_LOCALE = "en";

export const PRIVACY_FIRST_PRODUCT_PRINCIPLE =
  "Collect only what is needed to style the user.";

export const FIREBASE_SERVICES = [
  "authentication",
  "cloud-firestore",
  "storage",
  "cloud-functions"
] as const;

export type SupportedLocale = typeof DEFAULT_LOCALE;
export type PlanTier = "free" | "premium";
export type FirebaseService = (typeof FIREBASE_SERVICES)[number];

export interface GrwmUserProfile {
  id: string;
  displayName: string;
  locale: SupportedLocale;
  planTier: PlanTier;
  privacyConsentVersion: string;
  createdAtIso: string;
}

export interface WardrobeImagePolicy {
  storageProvider: "firebase-storage";
  requiresAuthenticatedOwner: true;
  allowPublicAccess: false;
}
