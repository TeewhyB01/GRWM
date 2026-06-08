import { PRIVACY_CONSENT_VERSION, firestoreCollections } from "@grwm/shared";
import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry.ts";

export const recordPrivacyConsentContract = {
  callable: "recordPrivacyConsent",
  reservedWrites: [firestoreCollections.privacyConsents],
  consentVersion: PRIVACY_CONSENT_VERSION,
  source: "mobile",
  currentWriter: "mobile-client-consent-screen",
  externalCallsEnabled: false
} as const;

export const recordPrivacyConsent = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("record-privacy-consent", request.auth?.uid ?? null)
);
