import { DEFAULT_LOCALE } from "@grwm/shared";

export const adminFoundation = {
  appName: "GRWM Admin",
  framework: "nextjs",
  language: "typescript",
  defaultLocale: DEFAULT_LOCALE,
  authProvider: "firebase-authentication",
  plannedRoles: ["owner", "admin", "moderator", "support", "analyst"] as const
};

export { adminRoutes } from "./lib/admin-routes.ts";
export {
  adminRoleOptions,
  canAccessAdminRoute,
  getAdminSessionPlaceholder,
  loginAdminPlaceholder,
  validateAdminRole
} from "./lib/auth.ts";
export {
  adminFirebaseEnvKeys,
  isAdminFirebaseConfigured
} from "./lib/firebase/config.ts";
