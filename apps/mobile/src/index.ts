import { DEFAULT_LOCALE, FIREBASE_SERVICES } from "@grwm/shared";

export const mobileFoundation = {
  appName: "GRWM",
  platform: "react-native",
  language: "typescript",
  defaultLocale: DEFAULT_LOCALE,
  expoGoSupported: false,
  developmentBuildRequired: true,
  firebaseServices: FIREBASE_SERVICES
} as const;
