import {
    NextRequest,
    NextResponse,
  } from "next/server";

  import {
    FieldValue,
    Timestamp,
  } from "firebase-admin/firestore";

  import {
    getAdminAuth,
    getAdminFirestore,
  } from "../../../../../lib/firebase-admin";

  import {
    getMollieClient,
  } from "../../../../../lib/payments/mollieClient";

  import {
    syncSubscriptionAccess,
  } from "../../../../../lib/subscription-access";

  import {
    SUBSCRIPTIONS,
  } from "../../../../../lib/subscriptions";

  export const runtime = "nodejs";

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
    if (
      typeof value !== "string"
    ) {
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

  function getBillingRecord(
    data:
      | Record<string, unknown>
      | undefined
  ): Record<string, unknown> | null {
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

    return billing as Record<
      string,
      unknown
    >;
  }

  function readBillingString(
    data:
      | Record<string, unknown>
      | undefined,
    key: string
  ): string | null {
    const billing =
      getBillingRecord(data);

    if (!billing) {
      return null;
    }

    return readString(
      billing[key]
    );
  }

  function readBillingValue(
    data:
      | Record<string, unknown>
      | undefined,
    key: string
  ): unknown {
    const billing =
      getBillingRecord(data);

    return billing
      ? billing[key]
      : undefined;
  }

  function readProfileSubscriptionStatus(
    data:
      | Record<string, unknown>
      | undefined
  ): string | null {
    if (!data) {
      return null;
    }

    const subscription =
      data.subscription;

    if (
      typeof subscription !== "object" ||
      subscription === null
    ) {
      return null;
    }

    return readString(
      (
        subscription as Record<
          string,
          unknown
        >
      ).status
    );
  }

  function toDate(
    value: unknown
  ): Date | null {
    if (
      value instanceof Timestamp
    ) {
      return value.toDate();
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      const converted =
        (
          value as {
            toDate: () => Date;
          }
        ).toDate();

      return Number.isNaN(
        converted.getTime()
      )
        ? null
        : converted;
    }

    if (
      value instanceof Date
    ) {
      return Number.isNaN(
        value.getTime()
      )
        ? null
        : value;
    }

    if (
      typeof value === "string"
    ) {
      const parsed =
        new Date(value);

      return Number.isNaN(
        parsed.getTime()
      )
        ? null
        : parsed;
    }

    return null;
  }

  function addOneCalendarMonth(
    source: Date
  ): Date {
    const year =
      source.getUTCFullYear();

    const month =
      source.getUTCMonth();

    const day =
      source.getUTCDate();

    const firstDayOfTargetMonth =
      new Date(
        Date.UTC(
          year,
          month + 1,
          1,
          source.getUTCHours(),
          source.getUTCMinutes(),
          source.getUTCSeconds(),
          source.getUTCMilliseconds()
        )
      );

    const targetYear =
      firstDayOfTargetMonth
        .getUTCFullYear();

    const targetMonth =
      firstDayOfTargetMonth
        .getUTCMonth();

    const lastDayOfTargetMonth =
      new Date(
        Date.UTC(
          targetYear,
          targetMonth + 1,
          0
        )
      ).getUTCDate();

    return new Date(
      Date.UTC(
        targetYear,
        targetMonth,
        Math.min(
          day,
          lastDayOfTargetMonth
        ),
        source.getUTCHours(),
        source.getUTCMinutes(),
        source.getUTCSeconds(),
        source.getUTCMilliseconds()
      )
    );
  }

  function getFutureDate(
    value: unknown,
    now: Date
  ): Date | null {
    const date =
      toDate(value);

    if (
      !date ||
      date.getTime() <=
        now.getTime()
    ) {
      return null;
    }

    return date;
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

  export async function GET(
    request: NextRequest
  ) {
    try {
      const idToken =
        getBearerToken(request);

      if (!idToken) {
        return NextResponse.json(
          {
            error:
              "Unauthorized.",
          },
          {
            status: 401,
          }
        );
      }

      const decodedToken =
        await getAdminAuth()
          .verifyIdToken(
            idToken,
            true
          );

      const firestore =
        getAdminFirestore();

      const userSnapshot =
        await firestore
          .collection("users")
          .doc(decodedToken.uid)
          .get();

      if (!userSnapshot.exists) {
        return NextResponse.json(
          {
            error:
              "User profile is unavailable.",
          },
          {
            status: 409,
          }
        );
      }

      const userData =
        userSnapshot.data();

      const providerStatus =
        readBillingString(
          userData,
          "mollieSubscriptionStatus"
        );

      const subscriptionId =
        readBillingString(
          userData,
          "mollieSubscriptionId"
        );

      const cancelAtPeriodEnd =
        readBillingValue(
          userData,
          "premiumCancelAtPeriodEnd"
        ) === true;

      const accessUntil =
        toDate(
          readBillingValue(
            userData,
            "premiumAccessUntil"
          )
        );

      const now =
        new Date();

      const accessContinues =
        Boolean(
          accessUntil &&
          accessUntil.getTime() >
            now.getTime()
        );

      return NextResponse.json(
        {
          linked:
            Boolean(subscriptionId),

          product:
            subscriptionId
              ? PREMIUM_PRODUCT
              : null,

          providerStatus,

          accessStatus:
            readProfileSubscriptionStatus(
              userData
            ),

          cancelAtPeriodEnd,

          accessContinues,

          accessUntil:
            accessUntil
              ? accessUntil.toISOString()
              : null,
        },
        {
          status: 200,

          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    } catch (error) {
      console.error(
        "SUBSCRIPTION Mollie status error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "Unable to load DOST Premium subscription status.",
        },
        {
          status: 500,
        }
      );
    }
  }

  export async function POST(
    request: NextRequest
  ) {
    try {
      const idToken =
        getBearerToken(request);

      if (!idToken) {
        return NextResponse.json(
          {
            error:
              "Unauthorized.",
          },
          {
            status: 401,
          }
        );
      }

      const decodedToken =
        await getAdminAuth()
          .verifyIdToken(
            idToken,
            true
          );

      const firestore =
        getAdminFirestore();

      const userReference =
        firestore
          .collection("users")
          .doc(decodedToken.uid);

      const userSnapshot =
        await userReference.get();

      if (!userSnapshot.exists) {
        return NextResponse.json(
          {
            error:
              "User profile is unavailable.",
          },
          {
            status: 409,
          }
        );
      }

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

      const firstPaymentId =
        readBillingString(
          userData,
          "premiumFirstPaymentId"
        );

      if (
        !customerId ||
        !subscriptionId
      ) {
        return NextResponse.json(
          {
            error:
              "No active Mollie subscription is linked to this DOST account.",

            code:
              "PREMIUM_SUBSCRIPTION_NOT_FOUND",
          },
          {
            status: 404,
          }
        );
      }

      const mollie =
        getMollieClient();

      /*
       * Always re-fetch the subscription
       * directly from Mollie. Firestore is
       * a local mirror, not the authority
       * for whether future charges are
       * still scheduled.
       */
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
        metadataUserId !==
          decodedToken.uid ||
        metadataProduct !==
          PREMIUM_PRODUCT ||
        metadataFlow !==
          PREMIUM_SUBSCRIPTION_FLOW
      ) {
        return NextResponse.json(
          {
            error:
              "The Mollie subscription does not belong to this DOST account.",

            code:
              "PREMIUM_SUBSCRIPTION_MISMATCH",
          },
          {
            status: 403,
          }
        );
      }

      const subscriptionReference =
        userReference
          .collection(
            "subscriptions"
          )
          .doc(subscriptionId);

      const subscriptionSnapshot =
        await subscriptionReference.get();

      const subscriptionData =
        subscriptionSnapshot.exists
          ? subscriptionSnapshot.data()
          : undefined;

      const now =
        new Date();

      /*
       * Resolve the end of the already-paid
       * Premium period before stopping future
       * Mollie charges.
       *
       * Priority:
       * 1. Current billing-period end written
       *    by the recurring-payment webhook.
       * 2. Existing cancellation access-until.
       * 3. Last successful recurring payment
       *    + one calendar month.
       * 4. First Premium payment + one calendar
       *    month (important before the first
       *    recurring payment has happened).
       */
      let accessUntil =
        getFutureDate(
          subscriptionData
            ?.currentPeriodEnd,
          now
        ) ??
        getFutureDate(
          readBillingValue(
            userData,
            "premiumAccessUntil"
          ),
          now
        );

      if (!accessUntil) {
        const lastSubscriptionPaidAt =
          toDate(
            readBillingValue(
              userData,
              "mollieLastSubscriptionPaidAt"
            )
          );

        if (
          lastSubscriptionPaidAt
        ) {
          const candidate =
            addOneCalendarMonth(
              lastSubscriptionPaidAt
            );

          if (
            candidate.getTime() >
            now.getTime()
          ) {
            accessUntil =
              candidate;
          }
        }
      }

      let firstPaymentPaidAt:
        | Date
        | null = null;

      if (
        !accessUntil &&
        firstPaymentId
      ) {
        const firstPayment =
          await mollie
            .payments
            .get(
              firstPaymentId
            );

        const paymentUserId =
          readMetadataString(
            firstPayment.metadata,
            "userId"
          );

        const paymentProduct =
          readMetadataString(
            firstPayment.metadata,
            "product"
          );

        if (
          firstPayment.status ===
            "paid" &&
          paymentUserId ===
            decodedToken.uid &&
          paymentProduct ===
            PREMIUM_PRODUCT
        ) {
          firstPaymentPaidAt =
            toDate(
              firstPayment.paidAt
            );

          if (
            firstPaymentPaidAt
          ) {
            const candidate =
              addOneCalendarMonth(
                firstPaymentPaidAt
              );

            if (
              candidate.getTime() >
              now.getTime()
            ) {
              accessUntil =
                candidate;
            }
          }
        }
      }

      /*
       * A normal active DOST Premium
       * subscription should always have a
       * determinable paid-through date.
       *
       * Do not stop future billing if we
       * cannot determine how long the user
       * must retain access. That avoids
       * accidentally charging correctly but
       * revoking paid access too early.
       */
      if (
        subscription.status ===
          "active" &&
        !accessUntil
      ) {
        return NextResponse.json(
          {
            error:
              "The end of the paid Premium period could not be determined.",

            code:
              "PREMIUM_ACCESS_PERIOD_UNAVAILABLE",
          },
          {
            status: 409,
          }
        );
      }

      let cancelledSubscription =
        subscription;

      /*
       * Idempotency:
       * if Mollie already reports this
       * subscription as canceled, do not
       * send a second cancel request.
       */
      if (
        subscription.status ===
          "active"
      ) {
        cancelledSubscription =
          await mollie
            .customerSubscriptions
            .cancel(
              subscriptionId,
              {
                customerId,
              }
            );
      } else if (
        subscription.status !==
          "canceled"
      ) {
        return NextResponse.json(
          {
            error:
              "The Mollie subscription cannot be canceled from its current status.",

            code:
              "PREMIUM_SUBSCRIPTION_NOT_CANCELLABLE",

            subscriptionStatus:
              subscription.status,
          },
          {
            status: 409,
          }
        );
      }

      if (
        cancelledSubscription.status !==
          "canceled"
      ) {
        return NextResponse.json(
          {
            error:
              "Mollie did not confirm the subscription cancellation.",

            code:
              "PREMIUM_CANCELLATION_NOT_CONFIRMED",

            subscriptionStatus:
              cancelledSubscription.status,
          },
          {
            status: 409,
          }
        );
      }

      const accessContinues =
        Boolean(
          accessUntil &&
          accessUntil.getTime() >
            now.getTime()
        );

      const existingCreatedAt =
        toDate(
          subscriptionData
            ?.createdAt
        );

      const existingPeriodStart =
        toDate(
          subscriptionData
            ?.currentPeriodStart
        ) ??
        firstPaymentPaidAt;

      await firestore.runTransaction(
        async (transaction) => {
          transaction.set(
            subscriptionReference,
            {
              id:
                subscriptionId,

              userId:
                decodedToken.uid,

              provider:
                "mollie",

              paymentMethod:
                subscriptionData
                  ?.paymentMethod ??
                "other",

              providerSubscriptionId:
                subscriptionId,

              product:
                PREMIUM_PRODUCT,

              /*
               * Provider/billing status is
               * canceled immediately because
               * future Mollie charges have
               * been stopped.
               */
              status:
                "cancelled",

              currentPeriodStart:
                existingPeriodStart
                  ? Timestamp.fromDate(
                      existingPeriodStart
                    )
                  : null,

              currentPeriodEnd:
                accessUntil
                  ? Timestamp.fromDate(
                      accessUntil
                    )
                  : null,

              createdAt:
                Timestamp.fromDate(
                  existingCreatedAt ??
                    now
                ),

              updatedAt:
                Timestamp.fromDate(
                  now
                ),

              cancelledAt:
                Timestamp.fromDate(
                  now
                ),
            },
            {
              merge: true,
            }
          );

          const billingUpdate: Record<
            string,
            unknown
          > = {
            mollieCustomerId:
              customerId,

            mollieSubscriptionId:
              subscriptionId,

            mollieSubscriptionStatus:
              "canceled",

            mollieSubscriptionUpdatedAt:
              FieldValue.serverTimestamp(),

            premiumCancelAtPeriodEnd:
              accessContinues,

            premiumCancellationRequestedAt:
              FieldValue.serverTimestamp(),
          };

          if (accessUntil) {
            billingUpdate[
              "premiumAccessUntil"
            ] =
              Timestamp.fromDate(
                accessUntil
              );
          }

          transaction.set(
            userReference,
            {
              billing:
                billingUpdate,

              updatedAt:
                FieldValue.serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        }
      );

      /*
       * Commercial access and Mollie billing
       * status are intentionally separate.
       *
       * Future charges stop now, but DOST
       * Premium remains ACTIVE until the end
       * of the period the customer already
       * paid for.
       */
      await syncSubscriptionAccess(
        firestore,
        decodedToken.uid,
        {
          id:
            SUBSCRIPTIONS.DOST_PREMIUM,

          status:
            accessContinues
              ? "ACTIVE"
              : "CANCELED",
        }
      );

      return NextResponse.json(
        {
          cancelled: true,

          provider:
            "mollie",

          product:
            PREMIUM_PRODUCT,

          subscriptionId,

          subscriptionStatus:
            cancelledSubscription.status,

          accessContinues,

          accessStatus:
            accessContinues
              ? "ACTIVE"
              : "CANCELED",

          accessUntil:
            accessUntil
              ? accessUntil.toISOString()
              : null,
        },
        {
          status: 200,

          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    } catch (error) {
      console.error(
        "SUBSCRIPTION Mollie cancel error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "Unable to cancel DOST Premium.",
        },
        {
          status: 500,
        }
      );
    }
  }
