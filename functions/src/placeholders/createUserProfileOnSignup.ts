import { firestoreCollections } from "@grwm/shared";
import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry.ts";

export const createUserProfileOnSignupContract = {
  trigger: "firebase-auth-user-create",
  reservedWrites: [firestoreCollections.users, firestoreCollections.userProfiles],
  currentWriter: "mobile-client-after-email-password-signup",
  externalCallsEnabled: false
} as const;

export const createUserProfileOnSignup = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("create-user-profile-on-signup", request.auth?.uid ?? null)
);
