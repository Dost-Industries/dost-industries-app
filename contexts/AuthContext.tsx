"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  refreshProfileAccess: () => Promise<void>;
};

type EnsureServerUserProfileResult = {
  premiumExpiryAt: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isGuest: true,
  isVerified: false,
  refreshProfileAccess: () =>
    Promise.resolve(),
});

/*
 * Browsers clamp very long setTimeout delays.
 *
 * Keep each timer comfortably below the signed 32-bit
 * millisecond limit (~24.8 days). If the Premium expiry is
 * further away, the timer is re-armed locally for the
 * remaining time without making another server request.
 */
const MAX_PREMIUM_EXPIRY_TIMER_MS =
  2_000_000_000;

async function ensureServerUserProfile(
  firebaseUser: User
): Promise<EnsureServerUserProfileResult> {
  const idToken =
    await firebaseUser.getIdToken();

  const response =
    await fetch(
      "/api/account/profile/ensure",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${idToken}`,
        },
      }
    );

  if (response.ok) {
    const data =
      (await response.json()) as {
        premiumExpiryAt?: unknown;
      };

    return {
      premiumExpiryAt:
        typeof data.premiumExpiryAt ===
        "string"
          ? data.premiumExpiryAt
          : null,
    };
  }

  let message =
    "The user profile could not be initialized.";

  try {
    const data =
      (await response.json()) as {
        error?: string;
      };

    if (data.error) {
      message = data.error;
    }
  } catch {
    // Keep the default message.
  }

  throw new Error(message);
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [initialized, setInitialized] =
    useState(false);

  const premiumExpiryTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const authenticatedUidRef =
    useRef<string | null>(null);

  const authenticatedUserRef =
    useRef<User | null>(null);

  const refreshProfileAccessRef =
    useRef<
      (() => Promise<void>) | null
    >(null);

  const refreshProfileAccess =
    useCallback(async () => {
      const refresh =
        refreshProfileAccessRef.current;

      if (!refresh) {
        return;
      }

      await refresh();
    }, []);

  useEffect(() => {
    let active = true;

    function clearPremiumExpiryTimer() {
      if (
        premiumExpiryTimerRef.current !==
        null
      ) {
        clearTimeout(
          premiumExpiryTimerRef.current
        );

        premiumExpiryTimerRef.current =
          null;
      }
    }

    async function refreshProfileAccessForUser(
      firebaseUser: User
    ) {
      if (
        !active ||
        authenticatedUidRef.current !==
          firebaseUser.uid
      ) {
        return;
      }

      try {
        const ensureResult =
          await ensureServerUserProfile(
            firebaseUser
          );

        if (
          !active ||
          authenticatedUidRef.current !==
            firebaseUser.uid
        ) {
          return;
        }

        const userProfile =
          await getUserProfile(
            firebaseUser.uid
          );

        if (
          !active ||
          authenticatedUidRef.current !==
            firebaseUser.uid
        ) {
          return;
        }

        if (!userProfile) {
          throw new Error(
            "USER_PROFILE_NOT_AVAILABLE"
          );
        }

        /*
         * Reconciliation has now run on the
         * server. Refresh the client profile so
         * entitlement-driven UI updates
         * immediately when paid Premium access
         * ends, or so a newly scheduled
         * cancellation can arm its expiry timer.
         */
        setProfile(userProfile);

        schedulePremiumExpiryTimer(
          firebaseUser,
          ensureResult.premiumExpiryAt
        );
      } catch (error) {
        /*
         * Do not destroy a valid authenticated
         * session because a background/access
         * refresh temporarily failed.
         *
         * Server-side PDF access and Firestore
         * security rules remain authoritative.
         * A normal page refresh/login will retry
         * reconciliation as well.
         */
        console.error(
          "Could not refresh Premium access profile:",
          error
        );
      }
    }

    function schedulePremiumExpiryTimer(
      firebaseUser: User,
      premiumExpiryAt: string | null
    ) {
      clearPremiumExpiryTimer();

      if (!premiumExpiryAt) {
        return;
      }

      const expiryTime =
        Date.parse(premiumExpiryAt);

      if (
        Number.isNaN(expiryTime)
      ) {
        console.error(
          "Invalid Premium expiry timestamp received."
        );

        return;
      }

      function armTimer() {
        if (
          !active ||
          authenticatedUidRef.current !==
            firebaseUser.uid
        ) {
          return;
        }

        const remainingMs =
          expiryTime - Date.now();

        if (
          remainingMs >
          MAX_PREMIUM_EXPIRY_TIMER_MS
        ) {
          premiumExpiryTimerRef.current =
            setTimeout(
              armTimer,
              MAX_PREMIUM_EXPIRY_TIMER_MS
            );

          return;
        }

        /*
         * Add a small margin so the server's
         * request-time comparison is certainly
         * on or after premiumAccessUntil.
         */
        const finalDelayMs =
          Math.max(
            remainingMs + 250,
            0
          );

        premiumExpiryTimerRef.current =
          setTimeout(
            () => {
              premiumExpiryTimerRef.current =
                null;

              void refreshProfileAccessForUser(
                firebaseUser
              );
            },
            finalDelayMs
          );
      }

      armTimer();
    }

    refreshProfileAccessRef.current =
      async () => {
        const firebaseUser =
          authenticatedUserRef.current;

        if (!firebaseUser) {
          return;
        }

        await refreshProfileAccessForUser(
          firebaseUser
        );
      };

    const unsubscribe =
      listenToAuthChanges(
        async (firebaseUser) => {
          clearPremiumExpiryTimer();

          if (!active) {
            return;
          }

          if (!firebaseUser) {
            authenticatedUidRef.current =
              null;

            authenticatedUserRef.current =
              null;

            setUser(null);
            setProfile(null);

            if (!initialized) {
              setInitialized(true);
              setLoading(false);
            }

            return;
          }

          if (!initialized) {
            setLoading(true);
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
              authenticatedUidRef.current =
                null;

              authenticatedUserRef.current =
                null;

              await logoutUser();

              if (!active) {
                return;
              }

              setUser(null);
              setProfile(null);

              return;
            }

            /*
             * Before reading the Firestore
             * profile on the client, let the
             * authenticated server verify
             * and repair/create the parent
             * users/{uid} document.
             *
             * The same endpoint also reconciles
             * a scheduled Premium cancellation
             * and returns only the safe paid-
             * access expiry timestamp needed by
             * the client timer.
             *
             * Existing purchases,
             * PDF credits, subscription
             * information and entitlements
             * are preserved.
             */
            const ensureResult =
              await ensureServerUserProfile(
                refreshedUser
              );

            if (!active) {
              return;
            }

            const userProfile =
              await getUserProfile(
                refreshedUser.uid
              );

            if (!active) {
              return;
            }

            if (!userProfile) {
              throw new Error(
                "USER_PROFILE_NOT_AVAILABLE"
              );
            }

            authenticatedUidRef.current =
              refreshedUser.uid;

            authenticatedUserRef.current =
              refreshedUser;

            setUser(refreshedUser);
            setProfile(userProfile);

            schedulePremiumExpiryTimer(
              refreshedUser,
              ensureResult.premiumExpiryAt
            );
          } catch (error) {
            console.error(
              "Could not initialize authenticated user:",
              error
            );

            if (active) {
              authenticatedUidRef.current =
                null;

              authenticatedUserRef.current =
                null;

              clearPremiumExpiryTimer();

              setUser(null);
              setProfile(null);
            }
          } finally {
            if (
              active &&
              !initialized
            ) {
              setInitialized(true);
              setLoading(false);
            }
          }
        }
      );

    return () => {
      active = false;

      authenticatedUidRef.current =
        null;

      authenticatedUserRef.current =
        null;

      refreshProfileAccessRef.current =
        null;

      clearPremiumExpiryTimer();

      unsubscribe();
    };
  }, [initialized]);

  const isVerified =
    Boolean(user?.emailVerified);

  const isAuthenticated =
    Boolean(user) && isVerified;

  const isGuest =
    !isAuthenticated;

  if (
    loading &&
    !initialized
  ) {
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
        refreshProfileAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
