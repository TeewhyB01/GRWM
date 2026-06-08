import type { MobileMessages } from "../i18n";
import type { ThemeTokens } from "../theme";
import type { MobileAuthState } from "../auth/authState";
import type { MobileRouteId } from "./routes";
import type { SupportedLocale } from "@grwm/shared";

export interface MobileOnboardingDraft {
  displayName: string;
  locale: SupportedLocale;
  countryCode: string;
  privacyConsentCompleted: boolean;
}

export interface MobileScreenProps {
  authState: MobileAuthState;
  messages: MobileMessages;
  navigate: (routeId: MobileRouteId) => void;
  onboardingDraft: MobileOnboardingDraft;
  logout: () => Promise<void>;
  theme: ThemeTokens;
  updateOnboardingDraft: (updates: Partial<MobileOnboardingDraft>) => void;
}
