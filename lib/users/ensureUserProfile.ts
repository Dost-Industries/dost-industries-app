import "server-only";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../firebase-admin";

type EnsureUserProfileResult = {
  created: boolean;
  repaired: boolean;
};

function getString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

export async function ensureUserProfileServer(
  userId: string
): Promise<EnsureUserProfileResult> {
  const auth =
    getAdminAuth();

  const firestore =
    getAdminFirestore();

  const authUser =
    await auth.getUser(
      userId
    );

  const authenticatedEmail =
    getString(
      authUser.email
    );

  if (!authenticatedEmail) {
    throw new Error(
      "AUTHENTICATED_USER_EMAIL_MISSING"
    );
  }

  const userReference =
    firestore
      .collection("users")
      .doc(userId);

  return firestore.runTransaction(
    async (transaction) => {
      const snapshot =
        await transaction.get(
          userReference
        );

      const existing =
        snapshot.exists
          ? snapshot.data() ?? {}
          : {};

      const existingName =
        getString(
          existing.name
        );

      const authDisplayName =
        getString(
          authUser.displayName
        );

      const name =
        existingName ??
        authDisplayName ??
        authenticatedEmail;

      const entitlements =
        Array.isArray(
          existing.entitlements
        )
          ? existing.entitlements.filter(
              (
                entitlement
              ): entitlement is string =>
                typeof entitlement ===
                  "string" &&
                entitlement.trim()
                  .length > 0
            )
          : [];

      const subscription =
        existing.subscription === null ||
        (
          typeof existing.subscription ===
            "object" &&
          existing.subscription !== null
        )
          ? existing.subscription
          : null;

      const role =
        existing.role === "ADMIN"
          ? "ADMIN"
          : "USER";

      const companyId =
        typeof existing.companyId ===
          "string"
          ? existing.companyId
          : null;

      const hasUid =
        existing.uid === userId;

      const hasName =
        Boolean(existingName);

      const hasEmail =
        getString(
          existing.email
        ) === authenticatedEmail;

      const hasEntitlements =
        Array.isArray(
          existing.entitlements
        );

      const hasSubscription =
        Object.prototype.hasOwnProperty.call(
          existing,
          "subscription"
        );

      const hasRole =
        existing.role === "USER" ||
        existing.role === "ADMIN";

      const hasCompanyId =
        Object.prototype.hasOwnProperty.call(
          existing,
          "companyId"
        );

      const hasCreatedAt =
        Object.prototype.hasOwnProperty.call(
          existing,
          "createdAt"
        );

      const isComplete =
        snapshot.exists &&
        hasUid &&
        hasName &&
        hasEmail &&
        hasEntitlements &&
        hasSubscription &&
        hasRole &&
        hasCompanyId &&
        hasCreatedAt;

      if (isComplete) {
        return {
          created: false,
          repaired: false,
        };
      }

      transaction.set(
        userReference,
        {
          uid: userId,

          name,

          email:
            authenticatedEmail,

          entitlements,

          subscription,

          role,

          companyId,

          createdAt:
            hasCreatedAt
              ? existing.createdAt
              : FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      return {
        created:
          !snapshot.exists,

        repaired:
          snapshot.exists,
      };
    }
  );
}
