import { FIREBASE_SERVICES } from "@grwm/shared";

export const functionsFoundation = {
  runtime: "firebase-cloud-functions",
  language: "typescript",
  minimumNodeVersion: 20,
  requiredServices: FIREBASE_SERVICES,
  sensitiveLoggingAllowed: false
} as const;
