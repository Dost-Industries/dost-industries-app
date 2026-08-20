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
    getMollieClient,
  } from "../../../../../lib/payments/mollieClient";

  import {
    MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW,
  } from "../../../../../lib/payments/molliePremiumService";

  export const runtime = "nodejs";

  const PREMIUM_PRODUCT =
    "dost-premium-monthly" as const;

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

      const pendingPaymentId =
        readBillingString(
          userData,
          "pendingPremiumPaymentId"
        );

      const pendingCustomerId =
        readBillingString(
          userData,
          "pendingPremiumCustomerId"
        );

      const pendingProduct =
        readBillingString(
          userData,
          "pendingPremiumProduct"
        );

      if (
        !pendingPaymentId ||
        !pendingCustomerId ||
        pendingProduct !==
          PREMIUM_PRODUCT
      ) {
        return NextResponse.json(
          {
            error:
              "No pending DOST Premium payment was found.",

            code:
              "PREMIUM_PAYMENT_NOT_FOUND",
          },
          {
            status: 404,
          }
        );
      }

      const mollie =
        getMollieClient();

      const payment =
        await mollie.payments.get(
          pendingPaymentId
        );

      const metadata =
        payment.metadata;

      if (
        !metadata ||
        typeof metadata !==
          "object"
      ) {
        return NextResponse.json(
          {
            error:
              "The Mollie payment metadata is invalid.",

            code:
              "PREMIUM_PAYMENT_INVALID",
          },
          {
            status: 400,
          }
        );
      }

      const paymentMetadata =
        metadata as {
          userId?: unknown;
          product?: unknown;
          flow?: unknown;
          customerId?: unknown;
        };

      if (
        paymentMetadata.userId !==
          decodedToken.uid ||
        paymentMetadata.product !==
          PREMIUM_PRODUCT ||
        paymentMetadata.flow !==
          MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW ||
        paymentMetadata.customerId !==
          pendingCustomerId
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

      /*
       * The first payment is now proven
       * to be paid and tied to this user.
       *
       * We deliberately do NOT grant
       * Premium here yet. The next step
       * creates the actual recurring
       * Mollie subscription first.
       */
      await userReference.update({
        "billing.pendingPremiumValidatedAt":
          FieldValue.serverTimestamp(),

        "billing.pendingPremiumPaymentStatus":
          "paid",

        updatedAt:
          FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        {
          validated: true,

          product:
            PREMIUM_PRODUCT,

          paymentId:
            pendingPaymentId,

          customerId:
            pendingCustomerId,
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
        "SUBSCRIPTION Mollie validate error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "Unable to validate the DOST Premium payment.",
        },
        {
          status: 500,
        }
      );
    }
  }
