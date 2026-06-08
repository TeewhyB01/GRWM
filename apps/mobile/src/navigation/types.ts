import type { MobileMessages } from "../i18n";
import type { ThemeTokens } from "../theme";
import type { MobileRouteId } from "./routes";

export interface MobileScreenProps {
  messages: MobileMessages;
  navigate: (routeId: MobileRouteId) => void;
  theme: ThemeTokens;
}
