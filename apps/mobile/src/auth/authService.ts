import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { getMobileAuth } from "../firebase/client.ts";
import { isMobileFirebaseConfigured } from "../firebase/config.ts";

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface MobileAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface FirebaseUserLike {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

export type AuthStateUnsubscribe = () => void;

export function mapFirebaseAuthUser(user: FirebaseUserLike): MobileAuthUser {
  return {
    id: user.uid,
    email: user.email ?? "",
    emailVerified: user.emailVerified
  };
}

export async function signUpWithEmailPassword(credentials: EmailPasswordCredentials): Promise<MobileAuthUser> {
  const credential = await createUserWithEmailAndPassword(
    getMobileAuth(),
    credentials.email,
    credentials.password
  );

  return mapFirebaseAuthUser(credential.user);
}

export async function loginWithEmailPassword(credentials: EmailPasswordCredentials): Promise<MobileAuthUser> {
  const credential = await signInWithEmailAndPassword(
    getMobileAuth(),
    credentials.email,
    credentials.password
  );

  return mapFirebaseAuthUser(credential.user);
}

export async function logout(): Promise<void> {
  await signOut(getMobileAuth());
}

export function listenToAuthState(onChange: (user: MobileAuthUser | null) => void): AuthStateUnsubscribe {
  if (!isMobileFirebaseConfigured()) {
    onChange(null);
    return () => undefined;
  }

  return onAuthStateChanged(getMobileAuth(), (user) => {
    onChange(user ? mapFirebaseAuthUser(user) : null);
  });
}

export const socialLoginTodos = [
  "TODO: Add Apple login after Firebase Auth email/password is verified.",
  "TODO: Add Google login after provider consent copy and account linking rules are designed."
] as const;
