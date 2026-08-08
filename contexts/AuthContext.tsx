"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "firebase/auth";

import LoadingScreen from "../app/components/LoadingScreen";

import {
  listenToAuthChanges,
  logoutUser,
  reloadCurrentUser,
} from "../firebase/auth";

import {
  getUserProfile,
  type UserProfile,
} from "../firebase/firestore";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isVerified: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isGuest: true,
  isVerified: false,
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = listenToAuthChanges(
      async (firebaseUser) => {
        if (!active) {
          return;
        }

        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        try {
          const refreshedUser =
            await reloadCurrentUser();

          if (!active) {
            return;
          }

          if (
            !refreshedUser ||
            !refreshedUser.emailVerified
          ) {
            await logoutUser();

            if (!active) {
              return;
            }

            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          setUser(refreshedUser);

          const userProfile =
            await getUserProfile(
              refreshedUser.uid
            );

          if (!active) {
            return;
          }

          setProfile(userProfile);
        } catch (error) {
          console.error(
            "Could not initialize authenticated user:",
            error
          );

          if (active) {
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const isVerified =
    Boolean(user?.emailVerified);

  const isAuthenticated =
    Boolean(user) && isVerified;

  const isGuest = !isAuthenticated;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        isGuest,
        isVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}