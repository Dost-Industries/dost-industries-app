import { randomUUID } from "node:crypto";

import {
  getPaymentProduct,
} from "./catalog";

import {
  createPdfExportCredit,
} from "./credits";

import {
  getProductEntitlementGrant,
} from "./entitlements";

import {
  createPurchaseRecord,
} from "./records";

import {
  findProcessedPurchaseByProviderId,
} from "./serverValidation";

import {
  savePdfExportCreditServer,
  savePurchaseRecordServer,
} from "./serverStorage";

import type {
  PaymentMethod,
  PaymentProduct,
  PaymentProvider,
} from "./types";

export type ProcessValidatedPurchaseParams = {
  userId: string;

  provider: PaymentProvider;

  paymentMethod: PaymentMethod;

  providerPurchaseId: string;

  product: PaymentProduct;
};

export type ProcessValidatedPurchaseResult =
  | {
      processed: true;

      purchaseId: string;

      pdfExportCreditsGranted: number;

      premiumAccessGranted: boolean;
    }
  | {
      processed: false;

      reason: "already-processed";

      purchaseId: string | null;
    };

export async function processValidatedPurchase(
  params: ProcessValidatedPurchaseParams
): Promise<ProcessValidatedPurchaseResult> {
  const existingPurchase =
    await findProcessedPurchaseByProviderId(
      params.userId,
      params.provider,
      params.providerPurchaseId,
      params.product
    );

  if (existingPurchase.exists) {
    return {
      processed: false,
      reason: "already-processed",
      purchaseId:
        existingPurchase.purchaseId,
    };
  }

  const product =
    getPaymentProduct(
      params.product
    );

  const grant =
    getProductEntitlementGrant(
      params.product
    );

  const purchaseId =
    randomUUID();

  const purchase =
    createPurchaseRecord({
      id: purchaseId,

      userId: params.userId,

      provider:
        params.provider,

      paymentMethod:
        params.paymentMethod,

      providerPurchaseId:
        params.providerPurchaseId,

      product:
        params.product,

      type:
        product.type,

      status:
        "completed",

      amount:
        product.amount,

      currency:
        product.currency,
    });

  await savePurchaseRecordServer(
    purchase
  );

  for (
    let index = 0;
    index <
    grant.pdfExportCredits;
    index += 1
  ) {
    const credit =
      createPdfExportCredit(
        randomUUID(),
        params.userId,
        purchaseId
      );

    await savePdfExportCreditServer(
      credit
    );
  }

  return {
    processed: true,

    purchaseId,

    pdfExportCreditsGranted:
      grant.pdfExportCredits,

    premiumAccessGranted:
      grant.entitlements.length > 0,
  };
}
