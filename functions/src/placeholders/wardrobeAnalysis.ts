import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const wardrobeAnalysis = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("wardrobe-analysis", request.auth?.uid ?? null)
);
