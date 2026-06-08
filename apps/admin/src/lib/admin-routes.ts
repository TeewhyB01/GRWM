export type AdminRouteId =
  | "dashboard"
  | "users"
  | "ai-monitoring"
  | "moderation"
  | "subscriptions"
  | "affiliate"
  | "settings";

export interface AdminRoute {
  id: AdminRouteId;
  href: `/${string}`;
  label: string;
  description: string;
  requiresAuth: true;
}

export const adminRoutes: readonly AdminRoute[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "Operational overview for the GRWM platform.",
    requiresAuth: true
  },
  {
    id: "users",
    href: "/users",
    label: "Users",
    description: "User account and privacy support workflows.",
    requiresAuth: true
  },
  {
    id: "ai-monitoring",
    href: "/ai-monitoring",
    label: "AI Monitoring",
    description: "Placeholder for recommendation safety and quality checks.",
    requiresAuth: true
  },
  {
    id: "moderation",
    href: "/moderation",
    label: "Moderation",
    description: "Placeholder for image and content review workflows.",
    requiresAuth: true
  },
  {
    id: "subscriptions",
    href: "/subscriptions",
    label: "Subscriptions",
    description: "Placeholder for premium plan operations.",
    requiresAuth: true
  },
  {
    id: "affiliate",
    href: "/affiliate",
    label: "Affiliate",
    description: "Placeholder for shopping attribution operations.",
    requiresAuth: true
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    description: "Admin configuration, roles, and audit settings.",
    requiresAuth: true
  }
] as const;

export function getAdminRoute(routeId: AdminRouteId): AdminRoute {
  const route = adminRoutes.find((candidate) => candidate.id === routeId);

  if (!route) {
    throw new Error(`Unknown admin route: ${routeId}`);
  }

  return route;
}
