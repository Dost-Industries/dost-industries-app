import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../../../../lib/firebase-admin";

import {
  getMollieClient,
} from "../../../../lib/payments/mollieClient";

const PREMIUM_PRODUCT =
  "dost-premium-monthly" as const;

const PREMIUM_SUBSCRIPTION_FLOW =
  "dost-premium-subscription" as const;

function getBearerToken(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    authorization
      .slice(7)
      .trim();

  return token || null;
}

function readString(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function readMetadataString(
  metadata: unknown,
  key: string
): string | null {
  if (
    typeof metadata !== "object" ||
    metadata === null
  ) {
    return null;
  }

  return readString(
    (
      metadata as Record<
        string,
        unknown
      >
    )[key]
  );
}

function readBillingString(
  data:
    | Record<string, unknown>
    | undefined,
  key: string
): string | null {
  if (!data) {
    return null;
  }

  const billing =
    data.billing;

  if (
    typeof billing !== "object" ||
    billing === null
  ) {
    return null;
  }

  return readString(
    (
      billing as Record<
        string,
        unknown
      >
    )[key]
  );
}

function getSafeErrorName(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (
      error as {
        name?: unknown;
      }
    ).name === "string"
  ) {
    return (
      error as {
        name: string;
      }
    ).name;
  }

  return "UnknownError";
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const idToken =
      getBearerToken(request);

    if (!idToken) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const auth =
      getAdminAuth();

    const decodedToken =
      await auth.verifyIdToken(
        idToken,
        true
      );

    const uid =
      decodedToken.uid;

    if (!uid) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const db =
      getAdminFirestore();

    const userReference =
      db
        .collection("users")
        .doc(uid);

    const userSnapshot =
      await userReference.get();

    /*
     * Before deleting the DOST account,
     * make sure an existing Mollie
     * subscription cannot continue
     * charging after the local account
     * and billing linkage are gone.
     */
    if (userSnapshot.exists) {
      const userData =
        userSnapshot.data();

      const customerId =
        readBillingString(
          userData,
          "mollieCustomerId"
        );

      const subscriptionId =
        readBillingString(
          userData,
          "mollieSubscriptionId"
        );

      /*
       * A stored subscription without a
       * stored customer identity is not
       * safe to ignore. Keep the account
       * intact so the billing link can be
       * investigated instead of orphaned.
       */
      if (
        subscriptionId &&
        !customerId
      ) {
        return NextResponse.json(
          {
            error:
              "The linked Mollie subscription could not be safely verified.",

            code:
              "ACCOUNT_DELETE_BILLING_IDENTITY_INCOMPLETE",
          },
          {
            status: 409,
          }
        );
      }

      if (
        customerId &&
        subscriptionId
      ) {
        const mollie =
          getMollieClient();

        const subscription =
          await mollie
            .customerSubscriptions
            .get(
              subscriptionId,
              {
                customerId,
              }
            );

        const metadataUserId =
          readMetadataString(
            subscription.metadata,
            "userId"
          );

        const metadataProduct =
          readMetadataString(
            subscription.metadata,
            "product"
          );

        const metadataFlow =
          readMetadataString(
            subscription.metadata,
            "flow"
          );

        if (
          subscription.id !==
            subscriptionId ||
          metadataUserId !== uid ||
          metadataProduct !==
            PREMIUM_PRODUCT ||
          metadataFlow !==
            PREMIUM_SUBSCRIPTION_FLOW
        ) {
          return NextResponse.json(
            {
              error:
                "The linked Mollie subscription could not be verified for this DOST account.",

              code:
                "ACCOUNT_DELETE_SUBSCRIPTION_MISMATCH",
            },
            {
              status: 403,
            }
          );
        }

        /*
         * Idempotency:
         * - active: stop future billing now;
         * - canceled/completed: no future
         *   cancellation request is needed;
         * - anything else: fail closed so
         *   account deletion never leaves an
         *   uncertain recurring billing state.
         */
        if (
          subscription.status ===
            "active"
        ) {
          const cancelledSubscription =
            await mollie
              .customerSubscriptions
              .cancel(
                subscriptionId,
                {
                  customerId,
                }
              );

          if (
            cancelledSubscription.status !==
              "canceled"
          ) {
            return NextResponse.json(
              {
                error:
                  "Mollie did not confirm cancellation before account deletion.",

                code:
                  "ACCOUNT_DELETE_CANCELLATION_NOT_CONFIRMED",

                subscriptionStatus:
                  cancelledSubscription.status,
              },
              {
                status: 409,
              }
            );
          }
        } else if (
          subscription.status !==
            "canceled" &&
          subscription.status !==
            "completed"
        ) {
          return NextResponse.json(
            {
              error:
                "The linked Mollie subscription is in a state that cannot be safely deleted.",

              code:
                "ACCOUNT_DELETE_SUBSCRIPTION_NOT_SAFE",

              subscriptionStatus:
                subscription.status,
            },
            {
              status: 409,
            }
          );
        }
      }
    }

    /*
     * Only after recurring billing is
     * confirmed stopped (or already ended)
     * do we remove the user's complete
     * Firestore tree and Firebase Auth
     * identity.
     */
    await db.recursiveDelete(
      userReference
    );

    await auth.deleteUser(uid);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Account deletion failed:",
      getSafeErrorName(error)
    );

    return NextResponse.json(
      {
        error:
          "The account could not be deleted.",
      },
      {
        status: 500,
      }
    );
  }
}
