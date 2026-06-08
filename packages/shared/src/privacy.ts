import type { PrivacyConsent, PrivacyConsentPurpose } from "./types";

export const PRIVACY_CONSENT_VERSION = "2026-06-foundation";

export const PRIVACY_CONSENT_PURPOSES: readonly PrivacyConsentPurpose[] = [
  "wardrobePhotoAnalysis",
  "stylePhotoAnalysis",
  "avatarCreation",
  "locationWeatherUse",
  "aiRecommendationUse",
  "marketingEmails",
  "analytics"
] as const;

export const privacyConsentCopy: Record<PrivacyConsentPurpose, string> = {
  wardrobePhotoAnalysis: "Allow GRWM to analyze wardrobe photos so items can be organized and styled.",
  stylePhotoAnalysis: "Allow GRWM to use style photos to understand fit and preference signals.",
  avatarCreation: "Allow GRWM to use selected photos for future avatar and try-on workflows.",
  locationWeatherUse: "Allow GRWM to use country or location context for weather-aware styling.",
  aiRecommendationUse: "Allow GRWM to use wardrobe and style data for outfit recommendations.",
  marketingEmails: "Allow GRWM to send optional product and style emails.",
  analytics: "Allow GRWM to collect privacy-conscious product analytics."
};

export function createDefaultPrivacyConsent(params: {
  id: string;
  userId: string;
  createdAtIso: string;
}): PrivacyConsent {
  return {
    id: params.id,
    userId: params.userId,
    version: PRIVACY_CONSENT_VERSION,
    wardrobePhotoAnalysis: false,
    stylePhotoAnalysis: false,
    avatarCreation: false,
    locationWeatherUse: false,
    aiRecommendationUse: false,
    marketingEmails: false,
    analytics: false,
    createdAtIso: params.createdAtIso,
    updatedAtIso: params.createdAtIso
  };
}
