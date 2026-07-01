import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
  } from "firebase/firestore";
  
  import { db } from "./config";
  
  export type UserProfile = {
    uid: string;
    name: string;
    email: string;
    plan: "FREE" | "PREMIUM" | "BUSINESS";
    role: "USER" | "ADMIN";
    modules: string[];
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
      plan: "FREE",
      role: "USER",
      modules: ["heat-input"],
      companyId: null,
      createdAt: serverTimestamp(),
    });
  }
  
  export async function getUserProfile(uid: string) {
    const snapshot = await getDoc(doc(db, "users", uid));
  
    if (!snapshot.exists()) {
      return null;
    }
  
    return snapshot.data() as UserProfile;
  }