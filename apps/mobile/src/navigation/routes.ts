export type MobileRouteId =
  | "welcome"
  | "login"
  | "signUp"
  | "language"
  | "country"
  | "privacy"
  | "onboarding"
  | "wardrobeSetupIntro"
  | "wardrobeSetupPrivacy"
  | "wardrobeSetupCategories"
  | "wardrobeSetupStyle"
  | "wardrobeSetupSummary"
  | "wardrobe"
  | "addWardrobeItem"
  | "today"
  | "settings";

export interface MobileRoute {
  id: MobileRouteId;
  labelKey: MobileRouteId;
  requiresAuth: boolean;
  group: "entry" | "onboarding" | "main";
  visibleInNavigation?: boolean;
}

export const mobileRoutes: readonly MobileRoute[] = [
  { id: "welcome", labelKey: "welcome", requiresAuth: false, group: "entry" },
  { id: "login", labelKey: "login", requiresAuth: false, group: "entry" },
  { id: "signUp", labelKey: "signUp", requiresAuth: false, group: "entry" },
  { id: "language", labelKey: "language", requiresAuth: false, group: "onboarding" },
  { id: "country", labelKey: "country", requiresAuth: false, group: "onboarding" },
  { id: "privacy", labelKey: "privacy", requiresAuth: true, group: "onboarding" },
  { id: "onboarding", labelKey: "onboarding", requiresAuth: true, group: "onboarding" },
  {
    id: "wardrobeSetupIntro",
    labelKey: "wardrobeSetupIntro",
    requiresAuth: true,
    group: "onboarding",
    visibleInNavigation: false
  },
  {
    id: "wardrobeSetupPrivacy",
    labelKey: "wardrobeSetupPrivacy",
    requiresAuth: true,
    group: "onboarding",
    visibleInNavigation: false
  },
  {
    id: "wardrobeSetupCategories",
    labelKey: "wardrobeSetupCategories",
    requiresAuth: true,
    group: "onboarding",
    visibleInNavigation: false
  },
  {
    id: "wardrobeSetupStyle",
    labelKey: "wardrobeSetupStyle",
    requiresAuth: true,
    group: "onboarding",
    visibleInNavigation: false
  },
  {
    id: "wardrobeSetupSummary",
    labelKey: "wardrobeSetupSummary",
    requiresAuth: true,
    group: "onboarding",
    visibleInNavigation: false
  },
  { id: "wardrobe", labelKey: "wardrobe", requiresAuth: true, group: "main" },
  {
    id: "addWardrobeItem",
    labelKey: "addWardrobeItem",
    requiresAuth: true,
    group: "main",
    visibleInNavigation: false
  },
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
