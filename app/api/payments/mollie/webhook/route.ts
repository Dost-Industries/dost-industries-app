import { NextResponse } from "next/server";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
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
  type SubscriptionStatus as DostSubscriptionStatus,
} from "../../../../../lib/subscriptions";

import type {
  PaymentMethod,
  SubscriptionStatus as BillingSubscriptionStatus,
} from "../../../../../lib/payments/types";

export const runtime = "nodejs";

const PREMIUM_PRODUCT =
  "dost-premium-monthly" as const;

const PREMIUM_SUBSCRIPTION_FLOW =
  "dost-premium-subscription" as const;

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

function readBillingValue(
  data:
    | Record<string, unknown>
    | undefined,
  key: string
): unknown {
  if (!data) {
    return undefined;
  }

  const billing =
    data.billing;

  if (
    typeof billing !== "object" ||
    billing === null
  ) {
    return undefined;
  }

  return (
    billing as Record<
      string,
      unknown
    >
  )[key];
}

function readBillingBoolean(
  data:
    | Record<string, unknown>
    | undefined,
  key: string
): boolean | null {
  const value =
    readBillingValue(
      data,
      key
    );

  return typeof value ===
    "boolean"
    ? value
    : null;
}

function toDate(
  value: unknown
): Date | null {
  if (value instanceof Timestamp) {
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

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (typeof value === "string") {
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

function mapPaymentMethod(
  method: unknown
): PaymentMethod {
  switch (readString(method)) {
    case "ideal":
      return "ideal";

    case "creditcard":
      return "credit-card";

    case "paypal":
      return "paypal";

    case "banktransfer":
      return "bank-transfer";

    case "applepay":
      return "apple-pay";

    case "googlepay":
      return "google-pay";

    default:
      return "other";
  }
}

function mapBillingStatus(
  mollieSubscriptionStatus: string,
  molliePaymentStatus: string
): BillingSubscriptionStatus {
  if (
    mollieSubscriptionStatus ===
    "canceled"
  ) {
    return "cancelled";
  }

  if (
    mollieSubscriptionStatus ===
    "completed"
  ) {
    return "expired";
  }

  if (
    mollieSubscriptionStatus ===
    "active"
  ) {
    if (
      molliePaymentStatus ===
        "failed" ||
      molliePaymentStatus ===
        "canceled" ||
      molliePaymentStatus ===
        "expired"
    ) {
      return "past-due";
    }

    return "active";
  }

  return "past-due";
}

function mapDostSubscriptionStatus(
  mollieSubscriptionStatus: string
): DostSubscriptionStatus {
  switch (
    mollieSubscriptionStatus
  ) {
    case "active":
      return "ACTIVE";

    case "canceled":
      return "CANCELED";

    case "completed":
      return "EXPIRED";

    default:
      return "INACTIVE";
  }
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

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const paymentId =
      formData.get("id");

    if (
      typeof paymentId !== "string" ||
      !paymentId.startsWith("tr_")
    ) {
      return NextResponse.json(
        {
          error:
            "INVALID_MOLLIE_PAYMENT_ID",
        },
        {
          status: 400,
        }
      );
    }

    const mollie =
      getMollieClient();

    /*
     * Never trust webhook payload data
     * beyond the Mollie resource ID.
     * Always fetch the payment directly
     * from Mollie before processing it.
     */
    const payment =
      await mollie.payments.get(
        paymentId
      );

    const subscriptionId =
      readString(
        payment.subscriptionId
      );

    /*
     * Existing one-time payments and
     * the first DOST Premium payment do
     * not have a subscriptionId.
     * Keep their current flow unchanged.
     */
    if (!subscriptionId) {
      return NextResponse.json(
        {
          received: true,
          processed:
            "non-subscription-payment",
        },
        {
          status: 200,
        }
      );
    }

    const customerId =
      readString(
        payment.customerId
      );

    const userId =
      readMetadataString(
        payment.metadata,
        "userId"
      );

    const product =
      readMetadataString(
        payment.metadata,
        "product"
      );

    const flow =
      readMetadataString(
        payment.metadata,
        "flow"
      );

    if (
      !customerId ||
      !userId ||
      product !== PREMIUM_PRODUCT ||
      flow !==
        PREMIUM_SUBSCRIPTION_FLOW
    ) {
      console.warn(
        "Mollie subscription webhook ignored: metadata mismatch."
      );

      return NextResponse.json(
        {
          received: true,
          ignored: true,
          reason:
            "SUBSCRIPTION_METADATA_MISMATCH",
        },
        {
          status: 200,
        }
      );
    }

    const subscription =
      await mollie
        .customerSubscriptions
        .get(
          subscriptionId,
          {
            customerId,
          }
        );

    const subscriptionUserId =
      readMetadataString(
        subscription.metadata,
        "userId"
      );

    const subscriptionProduct =
      readMetadataString(
        subscription.metadata,
        "product"
      );

    const subscriptionFlow =
      readMetadataString(
        subscription.metadata,
        "flow"
      );

    if (
      subscription.id !==
        subscriptionId ||
      subscriptionUserId !==
        userId ||
      subscriptionProduct !==
        PREMIUM_PRODUCT ||
      subscriptionFlow !==
        PREMIUM_SUBSCRIPTION_FLOW
    ) {
      console.warn(
        "Mollie subscription webhook ignored: subscription mismatch."
      );

      return NextResponse.json(
        {
          received: true,
          ignored: true,
          reason:
            "SUBSCRIPTION_MISMATCH",
        },
        {
          status: 200,
        }
      );
    }

    const firestore =
      getAdminFirestore();

    const userReference =
      firestore
        .collection("users")
        .doc(userId);

    const userSnapshot =
      await userReference.get();

    if (!userSnapshot.exists) {
      console.warn(
        "Mollie subscription webhook ignored: DOST user profile missing."
      );

      return NextResponse.json(
        {
          received: true,
          ignored: true,
          reason:
            "USER_PROFILE_MISSING",
        },
        {
          status: 200,
        }
      );
    }

    const userData =
      userSnapshot.data();

    const storedCustomerId =
      readBillingString(
        userData,
        "mollieCustomerId"
      );

    const storedSubscriptionId =
      readBillingString(
        userData,
        "mollieSubscriptionId"
      );

    if (
      storedCustomerId !==
        customerId ||
      storedSubscriptionId !==
        subscriptionId
    ) {
      console.warn(
        "Mollie subscription webhook ignored: stored billing identity mismatch."
      );

      return NextResponse.json(
        {
          received: true,
          ignored: true,
          reason:
            "STORED_BILLING_IDENTITY_MISMATCH",
        },
        {
          status: 200,
        }
      );
    }

    const subscriptionReference =
      userReference
        .collection("subscriptions")
        .doc(subscriptionId);

    const existingSubscriptionSnapshot =
      await subscriptionReference.get();

    const existingSubscriptionData =
      existingSubscriptionSnapshot.exists
        ? existingSubscriptionSnapshot.data()
        : undefined;

    const now =
      new Date();

    const existingPeriodStart =
      toDate(
        existingSubscriptionData
          ?.currentPeriodStart
      );

    const existingPeriodEnd =
      toDate(
        existingSubscriptionData
          ?.currentPeriodEnd
      );

    const existingCreatedAt =
      toDate(
        existingSubscriptionData
          ?.createdAt
      );

    const paymentStatus =
      readString(
        payment.status
      ) ?? "unknown";

    const mollieSubscriptionStatus =
      readString(
        subscription.status
      ) ?? "unknown";

    const paidAt =
      paymentStatus === "paid"
        ? toDate(
            payment.paidAt
          )
        : null;

    const currentPeriodStart =
      paidAt ??
      existingPeriodStart;

    const paidPeriodEnd =
      paidAt
        ? addOneCalendarMonth(
            paidAt
          )
        : null;

    const storedAccessUntil =
      toDate(
        readBillingValue(
          userData,
          "premiumAccessUntil"
        )
      );

    const cancelAtPeriodEnd =
      readBillingBoolean(
        userData,
        "premiumCancelAtPeriodEnd"
      ) === true;

    const futureDates = [
      paidPeriodEnd,
      existingPeriodEnd,
      storedAccessUntil,
    ].filter(
      (value): value is Date =>
        Boolean(value)
    );

    const currentPeriodEnd =
      futureDates.length > 0
        ? new Date(
            Math.max(
              ...futureDates.map(
                (value) =>
                  value.getTime()
              )
            )
          )
        : null;

    const billingStatus =
      mapBillingStatus(
        mollieSubscriptionStatus,
        paymentStatus
      );

    /*
     * Mollie cancellation stops future
     * billing immediately, but DOST may
     * intentionally keep Premium access
     * active until the already-paid period
     * ends.
     *
     * A late payment webhook must therefore
     * never overwrite that retained access
     * simply because Mollie now reports the
     * subscription itself as canceled.
     */
    const paidAccessStillActive =
      mollieSubscriptionStatus ===
        "canceled" &&
      currentPeriodEnd !== null &&
      currentPeriodEnd.getTime() >
        now.getTime() &&
      (
        cancelAtPeriodEnd ||
        storedAccessUntil !== null ||
        existingPeriodEnd !== null
      );

    const dostSubscriptionStatus:
      DostSubscriptionStatus =
      paidAccessStillActive
        ? "ACTIVE"
        : mapDostSubscriptionStatus(
            mollieSubscriptionStatus
          );

    const billingUpdate: Record<
      string,
      unknown
    > = {
      mollieCustomerId:
        customerId,

      mollieSubscriptionId:
        subscriptionId,

      mollieSubscriptionStatus,

      mollieSubscriptionUpdatedAt:
        FieldValue.serverTimestamp(),

      mollieLastSubscriptionPaymentId:
        payment.id,

      mollieLastSubscriptionPaymentStatus:
        paymentStatus,

      mollieLastSubscriptionPaymentUpdatedAt:
        FieldValue.serverTimestamp(),
    };

    if (
      paidAccessStillActive &&
      currentPeriodEnd
    ) {
      billingUpdate[
        "premiumAccessUntil"
      ] =
        Timestamp.fromDate(
          currentPeriodEnd
        );

      billingUpdate[
        "premiumCancelAtPeriodEnd"
      ] = true;
    }

    if (paidAt) {
      billingUpdate[
        "mollieLastSubscriptionPaidAt"
      ] =
        Timestamp.fromDate(
          paidAt
        );
    }

    await firestore.runTransaction(
      async (transaction) => {
        transaction.set(
          subscriptionReference,
          {
            id:
              subscriptionId,

            userId,

            provider:
              "mollie",

            paymentMethod:
              mapPaymentMethod(
                payment.method
              ),

            providerSubscriptionId:
              subscriptionId,

            product:
              PREMIUM_PRODUCT,

            status:
              billingStatus,

            currentPeriodStart:
              currentPeriodStart
                ? Timestamp.fromDate(
                    currentPeriodStart
                  )
                : null,

            currentPeriodEnd:
              currentPeriodEnd
                ? Timestamp.fromDate(
                    currentPeriodEnd
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

            lastPaymentId:
              payment.id,

            lastPaymentStatus:
              paymentStatus,
          },
          {
            merge: true,
          }
        );

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
     * Access normally follows the actual
     * Mollie subscription state, not a
     * single failed recurring-payment
     * attempt.
     *
     * Cancellation is the deliberate
     * exception: billing can already be
     * canceled while the customer still
     * owns Premium access through the end
     * of the period already paid for.
     */
    await syncSubscriptionAccess(
      firestore,
      userId,
      {
        id:
          SUBSCRIPTIONS.DOST_PREMIUM,

        status:
          dostSubscriptionStatus,
      }
    );

    return NextResponse.json(
      {
        received: true,
        processed:
          "subscription-payment",
        paymentStatus,
        subscriptionStatus:
          mollieSubscriptionStatus,
        accessStatus:
          dostSubscriptionStatus,

        accessUntil:
          paidAccessStillActive &&
          currentPeriodEnd
            ? currentPeriodEnd.toISOString()
            : null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Mollie webhook error:",
      getSafeErrorName(error)
    );

    /*
     * A non-200 response tells Mollie
     * that processing failed and allows
     * its webhook retry mechanism to
     * try again later.
     */
    return NextResponse.json(
      {
        error:
          "MOLLIE_WEBHOOK_PROCESSING_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
