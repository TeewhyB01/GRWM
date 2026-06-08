import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore
} from "firebase/firestore";

import { getMobileFirebaseConfig } from "./config.ts";

let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;
let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;

interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface AuthPersistenceValue {
  readonly [key: string]: unknown;
}

type AuthPersistenceStorageValue = AuthPersistenceValue | string;

interface AuthPersistenceAdapter extends Persistence {
  _isAvailable(): Promise<boolean>;
  _set(key: string, value: AuthPersistenceStorageValue): Promise<void>;
  _get<T extends AuthPersistenceStorageValue>(key: string): Promise<T | null>;
  _remove(key: string): Promise<void>;
  _addListener(): void;
  _removeListener(): void;
  _shouldAllowMigration: boolean;
}

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

export function createAsyncStorageAuthPersistence(storage: AsyncStorageLike): Persistence {
  const persistence: AuthPersistenceAdapter = {
    type: "LOCAL",
    _shouldAllowMigration: true,
    async _isAvailable() {
      const testKey = "grwm.firebase.auth.persistence.available";

      try {
        await storage.setItem(testKey, "1");
        await storage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    },
    async _set(key, value) {
      await storage.setItem(key, JSON.stringify(value));
    },
    async _get<T extends AuthPersistenceStorageValue>(key: string) {
      const storedValue = await storage.getItem(key);

      if (storedValue === null) {
        return null;
      }

      return JSON.parse(storedValue) as T;
    },
    async _remove(key) {
      await storage.removeItem(key);
    },
    _addListener() {
      // AsyncStorage does not provide cross-process storage events.
    },
    _removeListener() {
      // AsyncStorage does not provide cross-process storage events.
    }
  };

  return persistence;
}

async function loadReactNativeAsyncStorage(): Promise<AsyncStorageLike> {
  const asyncStorageModule = await import("@react-native-async-storage/async-storage");
  const possibleDefault = asyncStorageModule.default as AsyncStorageLike | { default?: AsyncStorageLike };
  const storage = "getItem" in possibleDefault ? possibleDefault : possibleDefault.default;

  if (!storage?.getItem || !storage.setItem || !storage.removeItem) {
    throw new Error("React Native AsyncStorage is unavailable for Firebase Auth persistence.");
  }

  return storage;
}

function connectMobileAuthEmulator(auth: Auth): void {
  const config = getMobileFirebaseConfig();

  if (config?.useEmulators && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    authEmulatorConnected = true;
  }
}

function connectMobileFirestoreEmulator(db: Firestore): void {
  const config = getMobileFirebaseConfig();

  if (config?.useEmulators && !firestoreEmulatorConnected) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    firestoreEmulatorConnected = true;
  }
}

export async function getMobileAuth(): Promise<Auth> {
  if (!cachedAuth) {
    const app = getMobileFirebaseApp();
    const storage = await loadReactNativeAsyncStorage();

    try {
      cachedAuth = initializeAuth(app, {
        persistence: createAsyncStorageAuthPersistence(storage)
      });
    } catch {
      cachedAuth = getAuth(app);
    }

    connectMobileAuthEmulator(cachedAuth);
  }

  return cachedAuth;
}

export function getMobileFirestore(): Firestore {
  if (!cachedFirestore) {
    cachedFirestore = getFirestore(getMobileFirebaseApp());
    connectMobileFirestoreEmulator(cachedFirestore);
  }

  return cachedFirestore;
}
