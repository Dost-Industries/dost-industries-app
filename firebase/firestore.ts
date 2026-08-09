import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

import type {
  Entitlement,
} from "../lib/entitlements";

import type {
  SubscriptionId,
  SubscriptionStatus,
} from "../lib/subscriptions";

export type UserSubscription = {
  id: SubscriptionId;
  status: SubscriptionStatus;
  updatedAt: unknown;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  entitlements: Entitlement[];
  subscription: UserSubscription | null;
  role: "USER" | "ADMIN";
  companyId: string | null;
  createdAt: unknown;
};

export async function createUserProfile(
  uid: string,
  name: string,
  email: string
) {
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    entitlements: [],
    subscription: null,
    role: "USER",
    companyId: null,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snapshot = await getDoc(
    doc(db, "users", uid)
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    entitlements:
      Array.isArray(data.entitlements)
        ? data.entitlements
        : [],
    subscription:
      data.subscription ?? null,
    role: data.role,
    companyId: data.companyId ?? null,
    createdAt: data.createdAt,
  } as UserProfile;
}

export async function deleteUserProfile(
  uid: string
) {
  await deleteDoc(doc(db, "users", uid));
}