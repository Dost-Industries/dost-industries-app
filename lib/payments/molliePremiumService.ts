import "server-only";

import {
  SequenceType,
} from "@mollie/api-client";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../firebase-admin";

import {
  getPaymentProduct,
} from "./catalog";

import {
  getMollieClient,
} from "./mollieClient";

const PREMIUM_PRODUCT =
  "dost-premium-monthly" as const;

const PREMIUM_FIRST_PAYMENT_FLOW =
  "dost-premium-first-payment" as const;

export type CreatedPremiumFirstPayment = {
  provider: "mollie";

  product:
    typeof PREMIUM_PRODUCT;

  customerId: string;

  paymentId: string;

  checkoutUrl: string;
};

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

function readExistingMollieCustomerId(
  data:
    | Record<string, unknown>
    | undefined
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

  const mollieCustomerId =
    (
      billing as {
        mollieCustomerId?: unknown;
      }
    ).mollieCustomerId;

  return readString(
    mollieCustomerId
  );
}

async function getOrCreateMollieCustomer(
  userId: string
): Promise<string> {
  const firestore =
    getAdminFirestore();

  const userReference =
    firestore
      .collection("users")
      .doc(userId);

  const userSnapshot =
    await userReference.get();

  if (!userSnapshot.exists) {
    throw new Error(
      "USER_PROFILE_MISSING"
    );
  }

  const userData =
    userSnapshot.data();

  const existingCustomerId =
    readExistingMollieCustomerId(
      userData
    );

  if (existingCustomerId) {
    return existingCustomerId;
  }

  const authUser =
    await getAdminAuth().getUser(
      userId
    );

  const email =
    readString(
      authUser.email
    ) ??
    readString(
      userData?.email
    );

  if (!email) {
    throw new Error(
      "USER_EMAIL_MISSING"
    );
  }

  const name =
    readString(
      userData?.name
    ) ??
    readString(
      authUser.displayName
    ) ??
    email ??
    "DOST Industries User";

  const mollie =
    getMollieClient();

  const customer =
    await mollie.customers.create({
      name,

      email,

      metadata: {
        dostUserId:
          userId,
      },
    });

  /*
   * Re-read in a transaction before
   * storing the customer ID.
   *
   * This protects our Firestore record
   * if two requests reach this point
   * very close together.
   */
  const storedCustomerId =
    await firestore.runTransaction(
      async (transaction) => {
        const latestSnapshot =
          await transaction.get(
            userReference
          );

        if (!latestSnapshot.exists) {
          throw new Error(
            "USER_PROFILE_MISSING"
          );
        }

        const latestCustomerId =
          readExistingMollieCustomerId(
            latestSnapshot.data()
          );

        if (latestCustomerId) {
          return latestCustomerId;
        }

        transaction.update(
          userReference,
          {
            "billing.mollieCustomerId":
              customer.id,

            "billing.mollieCustomerCreatedAt":
              FieldValue.serverTimestamp(),

            updatedAt:
              FieldValue.serverTimestamp(),
          }
        );

        return customer.id;
      }
    );

  return storedCustomerId;
}

export async function createMolliePremiumFirstPayment(
  userId: string
): Promise<CreatedPremiumFirstPayment> {
  const product =
    getPaymentProduct(
      PREMIUM_PRODUCT
    );

  if (
    product.type !== "subscription"
  ) {
    throw new Error(
      "PREMIUM_PRODUCT_CONFIGURATION_INVALID"
    );
  }

  const customerId =
    await getOrCreateMollieCustomer(
      userId
    );

  const mollie =
    getMollieClient();

  const webhookUrl =
    getWebhookUrl();

  const payment =
    await mollie.customerPayments.create({
      customerId,

      amount: {
        currency:
          product.currency,

        value:
          formatAmount(
            product.amount
          ),
      },

      description:
        "DOST Premium - first month",

      sequenceType:
        SequenceType.first,

      redirectUrl:
        `${getAppUrl()}/account?premiumReturn=1`,

      ...(webhookUrl
        ? {
            webhookUrl,
          }
        : {}),

      metadata: {
        userId,

        product:
          PREMIUM_PRODUCT,

        flow:
          PREMIUM_FIRST_PAYMENT_FLOW,

        customerId,
      },
    });

  const checkoutUrl =
    payment.getCheckoutUrl();

  if (!checkoutUrl) {
    throw new Error(
      "MOLLIE_CHECKOUT_URL_MISSING"
    );
  }

  return {
    provider: "mollie",

    product:
      PREMIUM_PRODUCT,

    customerId,

    paymentId:
      payment.id,

    checkoutUrl,
  };
}

export const MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW =
  PREMIUM_FIRST_PAYMENT_FLOW;
