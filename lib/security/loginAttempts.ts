import "server-only";

import { getAdminFirestore } from "../firebase-admin";
import type { LoginAttempt } from "./types";

const COLLECTION = "login_attempts";

export async function getLoginAttempt(
  identifier: string
): Promise<LoginAttempt | null> {
  const db = getAdminFirestore();

  const snapshot = await db
    .collection(COLLECTION)
    .doc(identifier)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() as LoginAttempt;
}

export async function saveLoginAttempt(
  data: LoginAttempt
): Promise<void> {
  const db = getAdminFirestore();

  await db
    .collection(COLLECTION)
    .doc(data.identifier)
    .set(data);
}

export async function updateLoginAttempt(
  identifier: string,
  data: Partial<LoginAttempt>
): Promise<void> {
  const db = getAdminFirestore();

  await db
    .collection(COLLECTION)
    .doc(identifier)
    .update(data);
}

export async function deleteLoginAttempt(
  identifier: string
): Promise<void> {
  const db = getAdminFirestore();

  await db
    .collection(COLLECTION)
    .doc(identifier)
    .delete();
}