export type MobileRouteId =
  | "welcome"
  | "login"
  | "signUp"
  | "language"
  | "country"
  | "privacy"
  | "onboarding"
  | "wardrobe"
  | "today"
  | "settings";

export interface MobileRoute {
  id: MobileRouteId;
  labelKey: MobileRouteId;
  requiresAuth: boolean;
  group: "entry" | "onboarding" | "main";
}

export const mobileRoutes: readonly MobileRoute[] = [
  { id: "welcome", labelKey: "welcome", requiresAuth: false, group: "entry" },
  { id: "login", labelKey: "login", requiresAuth: false, group: "entry" },
  { id: "signUp", labelKey: "signUp", requiresAuth: false, group: "entry" },
  { id: "language", labelKey: "language", requiresAuth: false, group: "onboarding" },
  { id: "country", labelKey: "country", requiresAuth: false, group: "onboarding" },
  { id: "privacy", labelKey: "privacy", requiresAuth: true, group: "onboarding" },
  { id: "onboarding", labelKey: "onboarding", requiresAuth: true, group: "onboarding" },
  { id: "wardrobe", labelKey: "wardrobe", requiresAuth: true, group: "main" },
  { id: "today", labelKey: "today", requiresAuth: true, group: "main" },
  { id: "settings", labelKey: "settings", requiresAuth: true, group: "main" }
] as const;

export const initialMobileRoute: MobileRouteId = "welcome";

export function getRouteById(routeId: MobileRouteId): MobileRoute {
  const route = mobileRoutes.find((candidate) => candidate.id === routeId);

  if (!route) {
    throw new Error(`Unknown mobile route: ${routeId}`);
  }

  return route;
}
