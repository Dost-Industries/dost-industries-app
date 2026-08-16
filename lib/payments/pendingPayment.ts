import type {
    PaymentMethod,
    PaymentProduct,
    PaymentProvider,
  } from "./types";
  
  const STORAGE_KEY =
    "dost_pending_payment";
  
  export type PendingPayment = {
    provider: PaymentProvider;
  
    paymentMethod: PaymentMethod;
  
    product: PaymentProduct;
  
    providerPurchaseId: string;
  };
  
  export function savePendingPayment(
    payment: PendingPayment
  ): void {
    if (typeof window === "undefined") {
      return;
    }
  
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payment)
    );
  }
  
  export function getPendingPayment():
    | PendingPayment
    | null {
    if (typeof window === "undefined") {
      return null;
    }
  
    const stored =
      window.sessionStorage.getItem(
        STORAGE_KEY
      );
  
    if (!stored) {
      return null;
    }
  
    try {
      const parsed =
        JSON.parse(stored) as Partial<PendingPayment>;
  
      if (
        !parsed.provider ||
        !parsed.paymentMethod ||
        !parsed.product ||
        !parsed.providerPurchaseId
      ) {
        return null;
      }
  
      return {
        provider:
          parsed.provider,
  
        paymentMethod:
          parsed.paymentMethod,
  
        product:
          parsed.product,
  
        providerPurchaseId:
          parsed.providerPurchaseId,
      };
    } catch {
      return null;
    }
  }
  
  export function clearPendingPayment(): void {
    if (typeof window === "undefined") {
      return;
    }
  
    window.sessionStorage.removeItem(
      STORAGE_KEY
    );
  }