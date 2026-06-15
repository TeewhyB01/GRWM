import {
  DEFAULT_LOCALE,
  PRIVACY_CONSENT_VERSION,
  firestoreCollections,
  hasRequiredFields,
  styleProfileSchema,
  userProfileSchema,
  userSchema,
  type StyleProfile,
  type SupportedLocale,
  type User,
  type UserProfile
} from "@grwm/shared";
import { doc, setDoc, writeBatch } from "firebase/firestore";

import { getMobileFirestore } from "../firebase/client.ts";

export interface ProfileAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface SignupProfileInput {
  displayName?: string;
  locale?: SupportedLocale;
  countryCode?: string;
}

export interface UserFoundationDocuments {
  user: User;
  userProfile: UserProfile;
}

export function normalizeDisplayName(displayName?: string): string {
  return displayName?.trim() ?? "";
}

export function normalizeCountryCode(countryCode?: string): string {
  return countryCode?.trim().toUpperCase() ?? "";
}

export function createUserRecord(params: {
  authUser: ProfileAuthUser;
  nowIso: string;
}): User {
  return {
    id: params.authUser.id,
    email: params.authUser.email,
    emailVerified: params.authUser.emailVerified,
    authProvider: "password",
    disabled: false,
    createdAtIso: params.nowIso,
    updatedAtIso: params.nowIso,
    lastLoginAtIso: params.nowIso
  };
}

export function createUserProfile(params: {
  authUser: ProfileAuthUser;
  input?: SignupProfileInput;
  nowIso: string;
}): UserProfile {
  return {
    id: params.authUser.id,
    userId: params.authUser.id,
    displayName: normalizeDisplayName(params.input?.displayName),
    locale: params.input?.locale ?? DEFAULT_LOCALE,
    countryCode: normalizeCountryCode(params.input?.countryCode),
    subscriptionPlanId: "free",
    privacyConsentVersion: PRIVACY_CONSENT_VERSION,
    createdAtIso: params.nowIso,
    updatedAtIso: params.nowIso
  };
}

export function createUserFoundationDocuments(params: {
  authUser: ProfileAuthUser;
  input?: SignupProfileInput;
  nowIso: string;
}): UserFoundationDocuments {
  return {
    user: createUserRecord(params),
    userProfile: createUserProfile(params)
  };
}

export function validateUserFoundationDocuments(documents: UserFoundationDocuments): boolean {
  return (
    hasRequiredFields(documents.user, userSchema) &&
    hasRequiredFields(documents.userProfile, userProfileSchema) &&
    documents.user.id === documents.userProfile.userId
  );
}

export async function createUserDocumentsOnSignup(params: {
  authUser: ProfileAuthUser;
  input?: SignupProfileInput;
  nowIso?: string;
}): Promise<UserFoundationDocuments> {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const documents = createUserFoundationDocuments(
    params.input
      ? {
          authUser: params.authUser,
          input: params.input,
          nowIso
        }
      : {
          authUser: params.authUser,
          nowIso
        }
  );
  const db = getMobileFirestore();
  const batch = writeBatch(db);

  batch.set(doc(db, firestoreCollections.users, params.authUser.id), documents.user);
  batch.set(doc(db, firestoreCollections.userProfiles, params.authUser.id), documents.userProfile);

  await batch.commit();

  return documents;
}

export async function updateUserProfile(params: {
  userId: string;
  displayName?: string;
  locale?: SupportedLocale;
  countryCode?: string;
  nowIso?: string;
}): Promise<void> {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const updates: Partial<UserProfile> = {
    updatedAtIso: nowIso
  };

  if (params.displayName !== undefined) {
    updates.displayName = normalizeDisplayName(params.displayName);
  }

  if (params.locale !== undefined) {
    updates.locale = params.locale;
  }

  if (params.countryCode !== undefined) {
    updates.countryCode = normalizeCountryCode(params.countryCode);
  }

  await setDoc(doc(getMobileFirestore(), firestoreCollections.userProfiles, params.userId), updates, {
    merge: true
  });
}

export function createStylePreferencePlaceholder(params: {
  userId: string;
  nowIso: string;
}): StyleProfile {
  return {
    id: params.userId,
    userId: params.userId,
    preferredColors: [],
    avoidedColors: [],
    preferredFits: [],
    styleKeywords: [],
    occasionPriorities: [],
    modestyPreference: "",
    weatherLocationPreference: "",
    bodyShapeNotesPrivate: "",
    createdAtIso: params.nowIso,
    updatedAtIso: params.nowIso
  };
}

export function validateStylePreferencePlaceholder(styleProfile: StyleProfile): boolean {
  return hasRequiredFields(styleProfile, styleProfileSchema);
}

export async function saveOnboardingPreferencePlaceholders(params: {
  userId: string;
  nowIso?: string;
}): Promise<void> {
  const styleProfile = createStylePreferencePlaceholder({
    userId: params.userId,
    nowIso: params.nowIso ?? new Date().toISOString()
  });

  // TODO: Replace these placeholders with explicit style/modesty/weather inputs during the onboarding phase.
  await setDoc(doc(getMobileFirestore(), firestoreCollections.styleProfiles, params.userId), styleProfile, {
    merge: true
  });
}
