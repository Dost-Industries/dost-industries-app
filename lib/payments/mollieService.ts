import "server-only";

import {
  getMollieClient,
} from "./mollieClient";

import {
  getPaymentProduct,
} from "./catalog";

import type {
  PaymentProviderService,
  CreatePaymentRequest,
  CreatedPayment,
} from "./service";

import type {
  PaymentValidationResult,
} from "./types";

function formatAmount(
  amount: number
): string {
  return amount.toFixed(2);
}

export const molliePaymentService: PaymentProviderService =
  {
    async createPayment(
      request: CreatePaymentRequest
    ): Promise<CreatedPayment> {
      const mollie =
        getMollieClient();

      const product =
        getPaymentProduct(
          request.product
        );

      const payment =
        await mollie.payments.create({
          amount: {
            currency:
              product.currency,
            value:
              formatAmount(
                product.amount
              ),
          },

          description:
            product.name,

          redirectUrl:
            `${
              process.env.NEXT_PUBLIC_APP_URL ??
              "http://localhost:3000"
            }/account`,

          metadata: {
            userId:
              request.userId,

            product:
              request.product,

            paymentMethod:
              request.paymentMethod,
          },
        });

      return {
        provider: "mollie",

        providerPurchaseId:
          payment.id,

        checkoutUrl:
          payment.getCheckoutUrl(),
      };
    },

    async validatePurchase(
      userId: string,
      providerPurchaseId: string,
      product
    ): Promise<PaymentValidationResult> {
      try {
        const mollie =
          getMollieClient();

        const payment =
          await mollie.payments.get(
            providerPurchaseId
          );

        const metadata =
          payment.metadata;

        if (
          !metadata ||
          typeof metadata !==
            "object"
        ) {
          return {
            valid: false,
            reason:
              "invalid-purchase",
          };
        }

        const paymentMetadata =
          metadata as {
            userId?: unknown;
            product?: unknown;
          };

        if (
          paymentMetadata.userId !==
          userId
        ) {
          return {
            valid: false,
            reason:
              "wrong-user",
          };
        }

        if (
          paymentMetadata.product !==
          product
        ) {
          return {
            valid: false,
            reason:
              "wrong-product",
          };
        }

        if (payment.status !== "paid") {
            return {
              valid: false,
              reason:
                "invalid-purchase",
            };
          }

        return {
          valid: true,

          userId,

          provider: "mollie",

          paymentMethod:
            "other",

          product,

          providerPurchaseId:
            payment.id,
        };
      } catch {
        return {
          valid: false,
          reason:
            "provider-error",
        };
      }
    },
  };