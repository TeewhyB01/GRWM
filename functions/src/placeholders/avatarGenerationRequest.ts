import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const avatarGenerationRequest = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("avatar-generation-request", request.auth?.uid ?? null)
);
