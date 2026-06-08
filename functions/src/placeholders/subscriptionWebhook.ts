import { onRequest } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry";

export const subscriptionWebhook = onRequest({ region: DEFAULT_FUNCTION_REGION }, (_request, response) => {
  response.status(501).json(createPlaceholderResponse("subscription-webhook", null));
});
