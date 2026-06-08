import {
  PRIVACY_CONSENT_PURPOSES,
  PRIVACY_CONSENT_VERSION,
  createDefaultPrivacyConsent,
  firestoreCollections,
  hasRequiredFields,
  privacyConsentSchema,
  userDeletionRequestSchema,
  type PrivacyConsent,
  type PrivacyConsentPurpose,
  type UserDeletionRequest
} from "@grwm/shared";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { getMobileFirestore } from "../firebase/client.ts";

export type PrivacyConsentChoices = Pick<PrivacyConsent, PrivacyConsentPurpose>;

export type ConsentGatedFeature =
  | "wardrobePhotoAnalysis"
  | "stylePhotoAnalysis"
  | "avatarCreation"
  | "weatherStyling"
  | "aiRecommendations";

export const consentGatedFeatureRequirements: Record<ConsentGatedFeature, PrivacyConsentPurpose> = {
  wardrobePhotoAnalysis: "wardrobePhotoAnalysis",
  stylePhotoAnalysis: "stylePhotoAnalysis",
  avatarCreation: "avatarCreation",
  weatherStyling: "locationWeatherUse",
  aiRecommendations: "aiRecommendationUse"
};

export const optionalPrivacyConsentPurposes: readonly PrivacyConsentPurpose[] = [
  "marketingEmails",
  "analytics"
] as const;

export function createPrivacyConsentChoices(
  choices: Partial<PrivacyConsentChoices> = {}
): PrivacyConsentChoices {
  return {
    wardrobePhotoAnalysis: choices.wardrobePhotoAnalysis ?? false,
    stylePhotoAnalysis: choices.stylePhotoAnalysis ?? false,
    avatarCreation: choices.avatarCreation ?? false,
    locationWeatherUse: choices.locationWeatherUse ?? false,
    aiRecommendationUse: choices.aiRecommendationUse ?? false,
    marketingEmails: choices.marketingEmails ?? false,
    analytics: choices.analytics ?? false
  };
}

export function mergePrivacyConsentChoices(
  existingChoices: Partial<PrivacyConsentChoices> | null,
  updates: Partial<PrivacyConsentChoices>
): PrivacyConsentChoices {
  return {
    ...createPrivacyConsentChoices(existingChoices ?? undefined),
    ...updates
  };
}

export function createPrivacyConsentDocument(params: {
  userId: string;
  choices?: Partial<PrivacyConsentChoices>;
  createdAtIso?: string;
  nowIso: string;
}): PrivacyConsent {
  return {
    ...createDefaultPrivacyConsent({
      id: params.userId,
      userId: params.userId,
      createdAtIso: params.createdAtIso ?? params.nowIso
    }),
    ...createPrivacyConsentChoices(params.choices),
    updatedAtIso: params.nowIso
  };
}

export function validatePrivacyConsentDocument(consent: PrivacyConsent): boolean {
  return (
    hasRequiredFields(consent, privacyConsentSchema) &&
    consent.version === PRIVACY_CONSENT_VERSION &&
    consent.source === "mobile" &&
    PRIVACY_CONSENT_PURPOSES.every((purpose) => typeof consent[purpose] === "boolean")
  );
}

export function canUseConsentGatedFeature(
  consent: PrivacyConsent | null,
  feature: ConsentGatedFeature
): boolean {
  return consent?.[consentGatedFeatureRequirements[feature]] === true;
}

export async function readPrivacyConsent(userId: string): Promise<PrivacyConsent | null> {
  const snapshot = await getDoc(doc(getMobileFirestore(), firestoreCollections.privacyConsents, userId));

  return snapshot.exists() ? (snapshot.data() as PrivacyConsent) : null;
}

export async function recordPrivacyConsent(params: {
  userId: string;
  choices: Partial<PrivacyConsentChoices>;
  createdAtIso?: string;
  nowIso?: string;
}): Promise<PrivacyConsent> {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const consentParams: {
    userId: string;
    choices: Partial<PrivacyConsentChoices>;
    createdAtIso?: string;
    nowIso: string;
  } = {
    userId: params.userId,
    choices: params.choices,
    nowIso
  };

  if (params.createdAtIso !== undefined) {
    consentParams.createdAtIso = params.createdAtIso;
  }

  const consent = createPrivacyConsentDocument(consentParams);

  await setDoc(doc(getMobileFirestore(), firestoreCollections.privacyConsents, params.userId), consent, {
    merge: true
  });

  return consent;
}

export async function updatePrivacyConsentChoices(params: {
  userId: string;
  choices: Partial<PrivacyConsentChoices>;
  nowIso?: string;
}): Promise<PrivacyConsent> {
  const existingConsent = await readPrivacyConsent(params.userId);
  const mergedChoices = mergePrivacyConsentChoices(existingConsent, params.choices);
  const recordParams: {
    userId: string;
    choices: PrivacyConsentChoices;
    createdAtIso?: string;
    nowIso?: string;
  } = {
    userId: params.userId,
    choices: mergedChoices
  };

  if (existingConsent?.createdAtIso !== undefined) {
    recordParams.createdAtIso = existingConsent.createdAtIso;
  }

  if (params.nowIso !== undefined) {
    recordParams.nowIso = params.nowIso;
  }

  return recordPrivacyConsent(recordParams);
}

export function createUserDeletionRequestDocument(params: {
  userId: string;
  reason?: string;
  nowIso: string;
}): UserDeletionRequest {
  return {
    id: params.userId,
    userId: params.userId,
    requestedAtIso: params.nowIso,
    status: "requested",
    reason: params.reason?.trim() || "Requested from mobile settings.",
    completedAtIso: ""
  };
}

export function validateUserDeletionRequestDocument(request: UserDeletionRequest): boolean {
  return (
    hasRequiredFields(request, userDeletionRequestSchema) &&
    request.id === request.userId &&
    request.status === "requested"
  );
}

export async function requestAccountDataDeletion(params: {
  userId: string;
  reason?: string;
  nowIso?: string;
}): Promise<UserDeletionRequest> {
  const requestParams: {
    userId: string;
    reason?: string;
    nowIso: string;
  } = {
    userId: params.userId,
    nowIso: params.nowIso ?? new Date().toISOString()
  };

  if (params.reason !== undefined) {
    requestParams.reason = params.reason;
  }

  const deletionRequest = createUserDeletionRequestDocument(requestParams);

  await setDoc(
    doc(getMobileFirestore(), firestoreCollections.userDeletionRequests, params.userId),
    deletionRequest,
    { merge: true }
  );

  return deletionRequest;
}
