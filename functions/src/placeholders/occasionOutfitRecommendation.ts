import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const occasionOutfitRecommendation = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("occasion-outfit-recommendation", request.auth?.uid ?? null)
);
