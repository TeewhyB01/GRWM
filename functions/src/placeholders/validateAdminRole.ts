import { ADMIN_ROLES } from "@grwm/shared";
import { onCall } from "firebase-functions/v2/https";

import { createPlaceholderResponse, DEFAULT_FUNCTION_REGION } from "./registry.ts";

export const validateAdminRoleContract = {
  supportedRoles: ADMIN_ROLES,
  customClaimsImplemented: false,
  adminUsersCollectionFallback: true,
  externalCallsEnabled: false
} as const;

export const validateAdminRole = onCall({ region: DEFAULT_FUNCTION_REGION }, (request) =>
  createPlaceholderResponse("validate-admin-role", request.auth?.uid ?? null)
);
