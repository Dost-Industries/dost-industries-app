import {
    NextRequest,
    NextResponse,
  } from "next/server";

  import {
    FieldValue,
  } from "firebase-admin/firestore";

  import {
    getAdminAuth,
    getAdminFirestore,
  } from "../../../../../lib/firebase-admin";

  import {
    getPaymentProduct,
  } from "../../../../../lib/payments/catalog";

  import {
    getMollieClient,
  } from "../../../../../lib/payments/mollieClient";

  import {
    MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW,
  } from "../../../../../lib/payments/molliePremiumService";

  import {
    syncSubscriptionAccess,
  } from "../../../../../lib/subscription-access";

  import {
    SUBSCRIPTIONS,
  } from "../../../../../lib/subscriptions";

  export const runtime = "nodejs";

  const PREMIUM_PRODUCT =
    "dost-premium-monthly" as const;

  const PREMIUM_INTERVAL =
    "1 month" as const;

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

  function formatAmount(
    amount: number
  ): string {
    return amount.toFixed(2);
  }

  function getAppUrl(): string {
    const value =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000";

    return value.replace(/\/+$/, "");
  }

  function getWebhookUrl():
    | string
    | undefined {
    const appUrl =
      getAppUrl();

    try {
      const url =
        new URL(appUrl);

      const isPublicHttps =
        url.protocol === "https:" &&
        url.hostname !== "localhost" &&
        url.hostname !== "127.0.0.1";

      if (!isPublicHttps) {
        return undefined;
      }

      return `${appUrl}/api/payments/mollie/webhook`;
    } catch {
      return undefined;
    }
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
          1
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
        )
      )
    );
  }

  function toDateOnly(
    date: Date
  ): string {
    return date
      .toISOString()
      .slice(0, 10);
  }

  function getSubscriptionStartDate(
    paidAt: unknown
  ): string {
    const paidAtValue =
      readString(paidAt);

    const paidDate =
      paidAtValue
        ? new Date(paidAtValue)
        : new Date();

    const safePaidDate =
      Number.isNaN(
        paidDate.getTime()
      )
        ? new Date()
        : paidDate;

    return toDateOnly(
      addOneCalendarMonth(
        safePaidDate
      )
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

  async function activateDostPremium(
    uid: string,
    mollieSubscriptionId: string,
    mollieSubscriptionStatus: string,
    customerId: string,
    firstPaymentId: string,
    startDate: string
  ): Promise<void> {
    const firestore =
      getAdminFirestore();

    const userReference =
      firestore
        .collection("users")
        .doc(uid);

    await userReference.set(
      {
        billing: {
          mollieCustomerId:
            customerId,

          mollieSubscriptionId,

          mollieSubscriptionStatus,

          mollieSubscriptionStartDate:
            startDate,

          premiumFirstPaymentId:
            firstPaymentId,

          mollieSubscriptionUpdatedAt:
            FieldValue.serverTimestamp(),

          pendingPremiumPaymentId:
            FieldValue.delete(),

          pendingPremiumCustomerId:
            FieldValue.delete(),

          pendingPremiumProduct:
            FieldValue.delete(),

          pendingPremiumCreatedAt:
            FieldValue.delete(),

          pendingPremiumValidatedAt:
            FieldValue.delete(),

          pendingPremiumPaymentStatus:
            FieldValue.delete(),
        },

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    await syncSubscriptionAccess(
      firestore,
      uid,
      {
        id:
          SUBSCRIPTIONS.DOST_PREMIUM,

        status:
          "ACTIVE",
      }
    );
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
          "pendingPremiumCustomerId"
        ) ??
        readBillingString(
          userData,
          "mollieCustomerId"
        );

      const firstPaymentId =
        readBillingString(
          userData,
          "pendingPremiumPaymentId"
        ) ??
        readBillingString(
          userData,
          "premiumFirstPaymentId"
        );

      const pendingProduct =
        readBillingString(
          userData,
          "pendingPremiumProduct"
        );

      const storedSubscriptionId =
        readBillingString(
          userData,
          "mollieSubscriptionId"
        );

      if (
        !customerId ||
        !firstPaymentId
      ) {
        return NextResponse.json(
          {
            error:
              "No DOST Premium activation is pending.",

            code:
              "PREMIUM_ACTIVATION_NOT_FOUND",
          },
          {
            status: 404,
          }
        );
      }

      if (
        pendingProduct &&
        pendingProduct !==
          PREMIUM_PRODUCT
      ) {
        return NextResponse.json(
          {
            error:
              "The pending Premium product is invalid.",

            code:
              "PREMIUM_PRODUCT_MISMATCH",
          },
          {
            status: 409,
          }
        );
      }

      const mollie =
        getMollieClient();

      /*
       * Recovery path:
       * If a previous request already
       * created and stored the Mollie
       * subscription, do not create
       * another one.
       */
      if (storedSubscriptionId) {
        const existingSubscription =
          await mollie
            .customerSubscriptions
            .get(
              storedSubscriptionId,
              {
                customerId,
              }
            );

        if (
          existingSubscription.status !==
            "active"
        ) {
          return NextResponse.json(
            {
              error:
                "The Mollie subscription is not active.",

              code:
                "PREMIUM_SUBSCRIPTION_NOT_ACTIVE",

              subscriptionStatus:
                existingSubscription.status,
            },
            {
              status: 409,
            }
          );
        }

        const recoveredStartDate =
          readString(
            existingSubscription.startDate
          ) ??
          getSubscriptionStartDate(
            new Date()
          );

        await activateDostPremium(
          decodedToken.uid,
          existingSubscription.id,
          existingSubscription.status,
          customerId,
          firstPaymentId,
          recoveredStartDate
        );

        return NextResponse.json(
          {
            activated: true,

            recovered: true,

            product:
              PREMIUM_PRODUCT,

            subscriptionId:
              existingSubscription.id,

            subscriptionStatus:
              existingSubscription.status,

            startDate:
              recoveredStartDate,
          },
          {
            status: 200,

            headers: {
              "Cache-Control":
                "private, no-store",
            },
          }
        );
      }

      /*
       * Never trust a browser-side
       * "validated" flag. Re-fetch the
       * first payment from Mollie here.
       */
      const payment =
        await mollie.payments.get(
          firstPaymentId
        );

      if (
        payment.status !== "paid"
      ) {
        return NextResponse.json(
          {
            error:
              "The DOST Premium first payment has not been completed.",

            code:
              "PREMIUM_PAYMENT_NOT_PAID",

            paymentStatus:
              payment.status,
          },
          {
            status: 409,
          }
        );
      }

      if (
        readMetadataString(
          payment.metadata,
          "userId"
        ) !== decodedToken.uid ||
        readMetadataString(
          payment.metadata,
          "product"
        ) !== PREMIUM_PRODUCT ||
        readMetadataString(
          payment.metadata,
          "flow"
        ) !==
          MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW ||
        readMetadataString(
          payment.metadata,
          "customerId"
        ) !== customerId
      ) {
        return NextResponse.json(
          {
            error:
              "The Mollie payment does not belong to this DOST account.",

            code:
              "PREMIUM_PAYMENT_MISMATCH",
          },
          {
            status: 403,
          }
        );
      }

      const mandateId =
        readString(
          payment.mandateId
        );

      if (!mandateId) {
        return NextResponse.json(
          {
            error:
              "The recurring-payment mandate is not available yet.",

            code:
              "PREMIUM_MANDATE_NOT_READY",
          },
          {
            status: 409,
          }
        );
      }

      const mandate =
        await mollie
          .customerMandates
          .get(
            mandateId,
            {
              customerId,
            }
          );

      if (
        mandate.status !== "pending" &&
        mandate.status !== "valid"
      ) {
        return NextResponse.json(
          {
            error:
              "The recurring-payment mandate is not usable.",

            code:
              "PREMIUM_MANDATE_UNAVAILABLE",

            mandateStatus:
              mandate.status,
          },
          {
            status: 409,
          }
        );
      }

      const product =
        getPaymentProduct(
          PREMIUM_PRODUCT
        );

      if (
        product.type !==
          "subscription"
      ) {
        throw new Error(
          "PREMIUM_PRODUCT_CONFIGURATION_INVALID"
        );
      }

      const startDate =
        getSubscriptionStartDate(
          payment.paidAt
        );

      /*
       * Recovery path for the rare case
       * where Mollie created the
       * subscription but our process
       * stopped before Firestore was
       * updated.
       *
       * Matching our own metadata keeps
       * a retry from creating a second
       * monthly subscription.
       */
      const subscriptions =
        await mollie
          .customerSubscriptions
          .page({
            customerId,
            limit: 250,
          });

      type MollieSubscriptionRecord = {
        id: string;
        status: string;
        startDate?: string | null;
        metadata?: unknown;
      };

      let matchingSubscription:
        | MollieSubscriptionRecord
        | null = null;

      for (
        const subscription of subscriptions
      ) {
        const sameUser =
          readMetadataString(
            subscription.metadata,
            "userId"
          ) === decodedToken.uid;

        const sameProduct =
          readMetadataString(
            subscription.metadata,
            "product"
          ) === PREMIUM_PRODUCT;

        const sameFirstPayment =
          readMetadataString(
            subscription.metadata,
            "firstPaymentId"
          ) === firstPaymentId;

        const sameFlow =
          readMetadataString(
            subscription.metadata,
            "flow"
          ) ===
          PREMIUM_SUBSCRIPTION_FLOW;

        if (
          sameUser &&
          sameProduct &&
          sameFirstPayment &&
          sameFlow
        ) {
          matchingSubscription =
            subscription;

          break;
        }
      }

      const webhookUrl =
        getWebhookUrl();

      const subscription =
        matchingSubscription ??
        (await mollie
          .customerSubscriptions
          .create({
            customerId,

            amount: {
              currency:
                product.currency,

              value:
                formatAmount(
                  product.amount
                ),
            },

            interval:
              PREMIUM_INTERVAL,

            startDate,

            description:
              "DOST Premium monthly subscription",

            mandateId,

            ...(webhookUrl
              ? {
                  webhookUrl,
                }
              : {}),

            metadata: {
              userId:
                decodedToken.uid,

              product:
                PREMIUM_PRODUCT,

              flow:
                PREMIUM_SUBSCRIPTION_FLOW,

              firstPaymentId,
            },
          }));

      if (
        subscription.status !==
          "active"
      ) {
        return NextResponse.json(
          {
            error:
              "The Mollie subscription was created but is not active.",

            code:
              "PREMIUM_SUBSCRIPTION_NOT_ACTIVE",

            subscriptionId:
              subscription.id,

            subscriptionStatus:
              subscription.status,
          },
          {
            status: 409,
          }
        );
      }

      await activateDostPremium(
        decodedToken.uid,
        subscription.id,
        subscription.status,
        customerId,
        firstPaymentId,
        readString(
          subscription.startDate
        ) ?? startDate
      );

      return NextResponse.json(
        {
          activated: true,

          recovered:
            Boolean(
              matchingSubscription
            ),

          product:
            PREMIUM_PRODUCT,

          subscriptionId:
            subscription.id,

          subscriptionStatus:
            subscription.status,

          startDate:
            readString(
              subscription.startDate
            ) ?? startDate,
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
        "SUBSCRIPTION Mollie activate error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "Unable to activate DOST Premium.",
        },
        {
          status: 500,
        }
      );
    }
  }
