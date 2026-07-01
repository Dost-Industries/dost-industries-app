import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    type User,
  } from "firebase/auth";
  
  import { auth } from "./config";
  
  export function listenToAuthChanges(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
  
  export async function registerWithEmail(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  
    if (credential.user) {
      await sendEmailVerification(credential.user);
    }
  
    return credential.user;
  }
  
  export async function loginWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  export async function logoutUser() {
    await signOut(auth);
  }
  
  export async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }