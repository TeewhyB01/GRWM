import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { getMobileAuth } from "../firebase/client.ts";
import { isMobileFirebaseConfigured } from "../firebase/config.ts";
import {
  createUserDocumentsOnSignup,
  type SignupProfileInput
} from "../profile/profileService.ts";

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface SignUpEmailPasswordInput extends EmailPasswordCredentials {
  profile?: SignupProfileInput;
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

export async function signUpWithEmailPassword(input: SignUpEmailPasswordInput): Promise<MobileAuthUser> {
  const auth = await getMobileAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password
  );
  const authUser = mapFirebaseAuthUser(credential.user);

  await createUserDocumentsOnSignup(
    input.profile
      ? {
          authUser,
          input: input.profile
        }
      : { authUser }
  );

  return authUser;
}

export async function loginWithEmailPassword(credentials: EmailPasswordCredentials): Promise<MobileAuthUser> {
  const auth = await getMobileAuth();
  const credential = await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  return mapFirebaseAuthUser(credential.user);
}

export async function logout(): Promise<void> {
  await signOut(await getMobileAuth());
}

export function listenToAuthState(onChange: (user: MobileAuthUser | null) => void): AuthStateUnsubscribe {
  if (!isMobileFirebaseConfigured()) {
    onChange(null);
    return () => undefined;
  }

  let active = true;
  let unsubscribe: AuthStateUnsubscribe | null = null;

  void getMobileAuth()
    .then((auth) => {
      if (!active) {
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        onChange(user ? mapFirebaseAuthUser(user) : null);
      });
    })
    .catch(() => {
      if (active) {
        onChange(null);
      }
    });

  return () => {
    active = false;
    unsubscribe?.();
  };
}

export const socialLoginTodos = [
  "TODO: Add Apple login after Firebase Auth email/password is verified.",
  "TODO: Add Google login after provider consent copy and account linking rules are designed."
] as const;
