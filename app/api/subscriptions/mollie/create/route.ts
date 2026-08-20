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
    hasActiveDostPremiumSubscription,
  } from "../../../../../lib/subscription-status";

  import {
    createMolliePremiumFirstPayment,
  } from "../../../../../lib/payments/molliePremiumService";

  import {
    ensureUserProfileServer,
  } from "../../../../../lib/users/ensureUserProfile";

  export const runtime = "nodejs";

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

      /*
       * Make sure the parent profile
       * exists before billing metadata
       * is written below it.
       */
      await ensureUserProfileServer(
        decodedToken.uid
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

      /*
       * Never create another Premium
       * checkout when the account
       * already has an active
       * DOST Premium subscription.
       */
      if (
        hasActiveDostPremiumSubscription(
          userData?.subscription
        )
      ) {
        return NextResponse.json(
          {
            error:
              "DOST Premium is already active.",

            code:
              "PREMIUM_ALREADY_ACTIVE",
          },
          {
            status: 409,
          }
        );
      }

      const createdPayment =
        await createMolliePremiumFirstPayment(
          decodedToken.uid
        );

      /*
       * Keep the first-payment ID on
       * the server as well as returning
       * it to the browser.
       *
       * This lets the return flow be
       * recovered even if browser
       * session storage is unavailable.
       */
      await userReference.update({
        "billing.pendingPremiumPaymentId":
          createdPayment.paymentId,

        "billing.pendingPremiumCustomerId":
          createdPayment.customerId,

        "billing.pendingPremiumProduct":
          createdPayment.product,

        "billing.pendingPremiumCreatedAt":
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        {
          provider:
            createdPayment.provider,

          product:
            createdPayment.product,

          paymentId:
            createdPayment.paymentId,

          checkoutUrl:
            createdPayment.checkoutUrl,
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
        "SUBSCRIPTION Mollie create error:",
        getSafeErrorName(error)
      );

      return NextResponse.json(
        {
          error:
            "Unable to start DOST Premium checkout.",
        },
        {
          status: 500,
        }
      );
    }
  }
