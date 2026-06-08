import type { MobileRouteId } from "../navigation/routes.ts";
import { getRouteById } from "../navigation/routes.ts";
import type { MobileAuthUser } from "./authService.ts";

export type MobileAuthStatus = "checking" | "signed-out" | "signed-in";
export type PrivacyConsentStatus = "checking" | "missing" | "recorded";

export interface MobileAuthState {
  status: MobileAuthStatus;
  user: MobileAuthUser | null;
}

export function createCheckingAuthState(): MobileAuthState {
  return {
    status: "checking",
    user: null
  };
}

export function createSignedOutAuthState(): MobileAuthState {
  return {
    status: "signed-out",
    user: null
  };
}

export function createPlaceholderSignedInAuthState(email = "user@grwm.local"): MobileAuthState {
  return {
    status: "signed-in",
    user: {
      id: "local-user-placeholder",
      email,
      emailVerified: false
    }
  };
}

export function toMobileAuthState(user: MobileAuthUser | null): MobileAuthState {
  return user
    ? {
        status: "signed-in",
        user
      }
    : createSignedOutAuthState();
}

export function canAccessMobileRoute(routeId: MobileRouteId, authState: MobileAuthState): boolean {
  const route = getRouteById(routeId);

  return !route.requiresAuth || authState.status === "signed-in";
}

export function getNextRouteForAuthAndConsent(params: {
  routeId: MobileRouteId;
  authState: MobileAuthState;
  privacyConsentStatus: PrivacyConsentStatus;
}): MobileRouteId | null {
  const route = getRouteById(params.routeId);

  if (params.authState.status === "checking") {
    return null;
  }

  if (params.authState.status === "signed-out") {
    return route.requiresAuth ? "login" : null;
  }

  if (params.privacyConsentStatus === "checking") {
    return null;
  }

  if (params.privacyConsentStatus === "missing" && params.routeId !== "privacy") {
    return "privacy";
  }

  if (
    params.privacyConsentStatus === "recorded" &&
    (route.group === "entry" || params.routeId === "privacy")
  ) {
    return "wardrobe";
  }

  return null;
}
