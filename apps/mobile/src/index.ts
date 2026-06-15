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
  createSignedOutAuthState,
  getNextRouteForAuthAndConsent
} from "./auth/authState.ts";
export {
  getMobileFirebaseConfig,
  getMobileFirebaseEmulatorConfig,
  isMobileFirebaseConfigured,
  mobileFirebaseEmulatorEnvKeys,
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
  mergePrivacyConsentChoices,
  optionalPrivacyConsentPurposes,
  validatePrivacyConsentDocument,
  validateUserDeletionRequestDocument
} from "./privacy/privacyService.ts";
export {
  completeWardrobeSetup,
  createDefaultWardrobeStyleBasics,
  createWardrobeSetupProfileDocument,
  getWardrobeSetupProfile,
  mergeWardrobeStyleBasics,
  resetWardrobeSetup,
  saveWardrobeSetupDraft,
  validateWardrobeSetupProfileDocument
} from "./wardrobe/wardrobeSetupService.ts";
export {
  createAsyncStorageAuthPersistence,
  getMobileStorage
} from "./firebase/client.ts";
export {
  createWardrobeUploadPlan,
  inferWardrobeImageContentType,
  runWardrobeUploadWithDependencies,
  validateWardrobeImageSelection
} from "./wardrobe/wardrobeUploadService.ts";
export type {
  WardrobeImageAssetInput,
  WardrobeUploadDependencies,
  WardrobeUploadPhase,
  WardrobeUploadProgressSnapshot,
  WardrobeUploadRequest,
  WardrobeUploadResult
} from "./wardrobe/wardrobeUploadTypes.ts";
export {
  continueWithLocalQaAccount,
  createLocalQaCredentials,
  createLocalQaEmail,
  createLocalQaPassword,
  getLocalQaEmailPrefix,
  getQaAccessState,
  isQaAccessEnabled
} from "./qa/qaAccess.ts";
export { mobileRoutes } from "./navigation/routes.ts";
export { themes } from "./theme/index.ts";
