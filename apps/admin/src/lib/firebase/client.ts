import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import { getAdminFirebaseClientConfig } from "./config.ts";

let cachedAuth: Auth | null = null;

export function getAdminFirebaseApp(): FirebaseApp {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const config = getAdminFirebaseClientConfig();

  if (!config) {
    throw new Error("Missing admin Firebase client environment variables.");
  }

  return initializeApp(config);
}

export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminFirebaseApp());
  }

  return cachedAuth;
}
