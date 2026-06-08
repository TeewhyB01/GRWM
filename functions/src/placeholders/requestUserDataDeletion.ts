import { firestoreCollections } from "@grwm/shared";
import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry.ts";

export const requestUserDataDeletionContract = {
  callable: "requestUserDataDeletion",
  reservedWrites: [firestoreCollections.userDeletionRequests],
  currentWriter: "mobile-client-settings-screen",
  clientDeletesDataImmediately: false,
  externalCallsEnabled: false
} as const;

export const requestUserDataDeletion = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("request-user-data-deletion", request.auth?.uid ?? null)
);
