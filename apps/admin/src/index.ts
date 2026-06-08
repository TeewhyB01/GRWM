import { DEFAULT_LOCALE } from "@grwm/shared";

export const adminFoundation = {
  appName: "GRWM Admin",
  framework: "nextjs",
  language: "typescript",
  defaultLocale: DEFAULT_LOCALE,
  authProvider: "firebase-authentication",
  plannedRoles: ["admin", "stylist-ops", "support"] as const
};

export { adminRoutes } from "./lib/admin-routes.ts";
export { canAccessAdminRoute, getAdminSessionPlaceholder } from "./lib/auth.ts";
