import { ADMIN_ROLES, hasAdminRole, isAdminRole, type AdminRole } from "@grwm/shared";

import type { AdminRouteId } from "./admin-routes";

export const adminRoleOptions = ADMIN_ROLES;

export interface AdminSession {
  userId: string;
  email: string;
  roles: readonly AdminRole[];
  active: boolean;
  isPlaceholder: true;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

const routeRoleRequirements: Record<AdminRouteId, readonly AdminRole[]> = {
  dashboard: ["owner", "admin", "analyst", "support"],
  users: ["owner", "admin", "support"],
  "ai-monitoring": ["owner", "admin", "analyst"],
  moderation: ["owner", "admin", "moderator"],
  subscriptions: ["owner", "admin", "analyst", "support"],
  affiliate: ["owner", "admin", "analyst"],
  settings: ["owner", "admin"]
};

export function getAdminSessionPlaceholder(): AdminSession {
  return {
    userId: "local-admin-placeholder",
    email: "admin@grwm.local",
    roles: ["owner"],
    active: true,
    isPlaceholder: true
  };
}

export function loginAdminPlaceholder(credentials: AdminLoginCredentials): AdminSession {
  return {
    ...getAdminSessionPlaceholder(),
    email: credentials.email || "admin@grwm.local"
  };
}

export function validateAdminRole(role: string): role is AdminRole {
  return isAdminRole(role);
}

export function canAccessAdminRoute(routeId: AdminRouteId, session: AdminSession | null): boolean {
  if (!session?.active) {
    return false;
  }

  return hasAdminRole(session.roles, routeRoleRequirements[routeId]);
}
