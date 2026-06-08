import { DEFAULT_LOCALE, FIREBASE_SERVICES } from "@grwm/shared";

export const mobileFoundation = {
  appName: "GRWM",
  framework: "expo-react-native",
  platform: "react-native",
  language: "typescript",
  defaultLocale: DEFAULT_LOCALE,
  expoGoSupported: false,
  developmentBuildRequired: true,
  firebaseServices: FIREBASE_SERVICES
} as const;

export { getMessages, supportedLocales } from "./i18n/index.ts";
export { mobileRoutes } from "./navigation/routes.ts";
export { themes } from "./theme/index.ts";
