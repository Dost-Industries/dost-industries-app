import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "./config";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function listenToAuthChanges(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function registerWithEmail(
  email: string,
  password: string
) {
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password
    );

  await sendEmailVerification(credential.user);

  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password
    );

  return credential.user;
}

export async function loginVerifiedWithEmail(
  email: string,
  password: string
) {
  const user = await loginWithEmail(email, password);

  await reload(user);

  if (!user.emailVerified) {
    await signOut(auth);

    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(
    auth,
    normalizeEmail(email)
  );
}

export async function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user.");
  }

  await reload(user);

  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
}

export async function reloadCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  await reload(user);

  return user;
}

export async function getFreshIdToken(): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user.");
  }

  return user.getIdToken(true);
}

export async function reauthenticateCurrentUser(
  password: string
) {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("No authenticated user.");
  }

  const credential = EmailAuthProvider.credential(
    normalizeEmail(user.email),
    password
  );

  await reauthenticateWithCredential(
    user,
    credential
  );

  await user.getIdToken(true);
}

export async function deleteCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user.");
  }

  await deleteUser(user);
}