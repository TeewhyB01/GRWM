import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const userDataDeletion = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("user-data-deletion", request.auth?.uid ?? null)
);
