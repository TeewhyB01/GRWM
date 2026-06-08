import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const affiliateClickTracking = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("affiliate-click-tracking", request.auth?.uid ?? null)
);
