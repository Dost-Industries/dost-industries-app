import "server-only";

import { getAdminFirestore } from "../firebase-admin";
import type { LoginAttempt } from "./types";

const COLLECTION = "login_attempts";

const RETENTION_MS =
  24 * 60 * 60 * 1000;

const CLEANUP_LIMIT = 50;

export async function cleanupExpiredLoginAttempts(): Promise<void> {
  const db = getAdminFirestore();

  const cutoff =
    Date.now() - RETENTION_MS;

  const snapshot = await db
    .collection(COLLECTION)
    .where("lastAttemptAt", "<", cutoff)
    .limit(CLEANUP_LIMIT)
    .get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();

  snapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  await batch.commit();
}

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

  const data =
    snapshot.data() as LoginAttempt;

  const expired =
    Date.now() - data.lastAttemptAt >=
    RETENTION_MS;

  if (expired) {
    await snapshot.ref.delete();
    return null;
  }

  return data;
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