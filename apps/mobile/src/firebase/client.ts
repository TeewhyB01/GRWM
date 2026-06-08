import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import { getMobileFirebaseConfig } from "./config.ts";

let cachedAuth: Auth | null = null;

export function getMobileFirebaseApp(): FirebaseApp {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const config = getMobileFirebaseConfig();

  if (!config) {
    throw new Error("Missing Expo Firebase client environment variables.");
  }

  return initializeApp(config);
}

export function getMobileAuth(): Auth {
  if (!cachedAuth) {
    // TODO: Add React Native persistence with AsyncStorage when storage dependencies are introduced.
    cachedAuth = getAuth(getMobileFirebaseApp());
  }

  return cachedAuth;
}
