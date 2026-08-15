import {
    getAdminFirestore,
  } from "../firebase-admin";
  
  import type {
    PaymentProduct,
    PaymentProvider,
  } from "./types";
  
  export type ProcessedPurchaseLookup = {
    exists: boolean;
    purchaseId: string | null;
  };
  
  export async function findProcessedPurchaseByProviderId(
    userId: string,
    provider: PaymentProvider,
    providerPurchaseId: string,
    product: PaymentProduct
  ): Promise<ProcessedPurchaseLookup> {
    const snapshot =
      await getAdminFirestore()
        .collection("users")
        .doc(userId)
        .collection("purchases")
        .where(
          "provider",
          "==",
          provider
        )
        .where(
          "providerPurchaseId",
          "==",
          providerPurchaseId
        )
        .where(
          "product",
          "==",
          product
        )
        .limit(1)
        .get();
  
    if (snapshot.empty) {
      return {
        exists: false,
        purchaseId: null,
      };
    }
  
    return {
      exists: true,
      purchaseId:
        snapshot.docs[0].id,
    };
  }