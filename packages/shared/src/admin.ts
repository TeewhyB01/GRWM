import type { AdminRole } from "./types";

export const ADMIN_ROLES = ["owner", "admin", "moderator", "support", "analyst"] as const;

export function isAdminRole(value: string): value is AdminRole {
  return ADMIN_ROLES.some((role) => role === value);
}

export function hasAdminRole(roles: readonly AdminRole[], allowedRoles: readonly AdminRole[]): boolean {
  return roles.some((role) => allowedRoles.includes(role));
}

export function canAccessAdminConsole(roles: readonly AdminRole[]): boolean {
  return hasAdminRole(roles, ADMIN_ROLES);
}
