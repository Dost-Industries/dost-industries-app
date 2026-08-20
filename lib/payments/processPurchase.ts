import { randomUUID } from "node:crypto";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  getAdminFirestore,
} from "../firebase-admin";

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

      userId:
        params.userId,

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

  const credits =
    Array.from(
      {
        length:
          grant.pdfExportCredits,
      },
      () =>
        createPdfExportCredit(
          randomUUID(),
          params.userId,
          purchaseId
        )
    );

  const firestore =
    getAdminFirestore();

  const userReference =
    firestore
      .collection("users")
      .doc(params.userId);

  const purchasesCollection =
    userReference.collection(
      "purchases"
    );

  const creditsCollection =
    userReference.collection(
      "pdf_export_credits"
    );

  const existingPurchaseQuery =
    purchasesCollection
      .where(
        "provider",
        "==",
        params.provider
      )
      .where(
        "providerPurchaseId",
        "==",
        params.providerPurchaseId
      )
      .where(
        "product",
        "==",
        params.product
      )
      .limit(1);

  return firestore.runTransaction<
    ProcessValidatedPurchaseResult
  >(
    async (transaction) => {
      /*
       * IMPORTANT:
       *
       * All reads happen before any writes.
       *
       * This lookup is part of the same
       * transaction as the purchase and
       * credit creation so that a retry
       * cannot leave a completed purchase
       * without its granted PDF credit.
       */
      const existingPurchaseSnapshot =
        await transaction.get(
          existingPurchaseQuery
        );

      if (
        !existingPurchaseSnapshot.empty
      ) {
        return {
          processed: false,

          reason:
            "already-processed",

          purchaseId:
            existingPurchaseSnapshot
              .docs[0].id,
        };
      }

      const purchaseReference =
        purchasesCollection.doc(
          purchase.id
        );

      transaction.set(
        purchaseReference,
        {
          ...purchase,

          createdAt:
            Timestamp.fromDate(
              purchase.createdAt
            ),

          updatedAt:
            Timestamp.fromDate(
              purchase.updatedAt
            ),
        }
      );

      for (
        const credit of credits
      ) {
        const creditReference =
          creditsCollection.doc(
            credit.id
          );

        transaction.set(
          creditReference,
          {
            ...credit,

            consumedAt:
              credit.consumedAt
                ? Timestamp.fromDate(
                    credit.consumedAt
                  )
                : null,

            createdAt:
              Timestamp.fromDate(
                credit.createdAt
              ),
          }
        );
      }

      return {
        processed: true,

        purchaseId,

        pdfExportCreditsGranted:
          credits.length,

        premiumAccessGranted:
          grant.entitlements.length >
          0,
      };
    }
  );
}
