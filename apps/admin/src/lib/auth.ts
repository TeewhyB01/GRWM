import type { AdminRole } from "@grwm/shared";

import type { AdminRouteId } from "./admin-routes";

export interface AdminSession {
  userId: string;
  email: string;
  roles: readonly AdminRole[];
  isPlaceholder: true;
}

export function getAdminSessionPlaceholder(): AdminSession {
  return {
    userId: "local-admin-placeholder",
    email: "admin@grwm.local",
    roles: ["owner"],
    isPlaceholder: true
  };
}

export function canAccessAdminRoute(_routeId: AdminRouteId, session: AdminSession | null): boolean {
  return Boolean(session?.roles.includes("owner") || session?.roles.includes("admin"));
}
