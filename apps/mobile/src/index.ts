import { DEFAULT_LOCALE, FIREBASE_SERVICES } from "@grwm/shared";

export const mobileFoundation = {
  appName: "GRWM",
  framework: "expo-react-native",
  platform: "react-native",
  language: "typescript",
  defaultLocale: DEFAULT_LOCALE,
  expoGoSupported: false,
  developmentBuildRequired: true,
  firebaseServices: FIREBASE_SERVICES
} as const;

export { getMessages, supportedLocales } from "./i18n/index.ts";
export {
  canAccessMobileRoute,
  createCheckingAuthState,
  createPlaceholderSignedInAuthState,
  createSignedOutAuthState
} from "./auth/authState.ts";
export {
  isMobileFirebaseConfigured,
  mobileFirebaseEnvKeys
} from "./firebase/config.ts";
export {
  mapFirebaseAuthUser,
  socialLoginTodos
} from "./auth/authService.ts";
export {
  createStylePreferencePlaceholder,
  createUserFoundationDocuments,
  createUserProfile,
  createUserRecord,
  normalizeCountryCode,
  normalizeDisplayName,
  validateStylePreferencePlaceholder,
  validateUserFoundationDocuments
} from "./profile/profileService.ts";
export {
  canUseConsentGatedFeature,
  consentGatedFeatureRequirements,
  createPrivacyConsentChoices,
  createPrivacyConsentDocument,
  createUserDeletionRequestDocument,
  optionalPrivacyConsentPurposes,
  validatePrivacyConsentDocument,
  validateUserDeletionRequestDocument
} from "./privacy/privacyService.ts";
export {
  createAsyncStorageAuthPersistence
} from "./firebase/client.ts";
export { mobileRoutes } from "./navigation/routes.ts";
export { themes } from "./theme/index.ts";
