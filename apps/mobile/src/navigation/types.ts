import type { MobileMessages } from "../i18n";
import type { ThemeTokens } from "../theme";
import type { MobileAuthState } from "../auth/authState";
import type { MobileRouteId } from "./routes";

export interface MobileScreenProps {
  authState: MobileAuthState;
  completeAuthPlaceholder: (routeId?: MobileRouteId) => void;
  logoutPlaceholder: () => void;
  messages: MobileMessages;
  navigate: (routeId: MobileRouteId) => void;
  theme: ThemeTokens;
}
