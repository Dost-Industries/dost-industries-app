import type {
    PaymentMethod,
    PaymentProduct,
    PaymentProvider,
  } from "./types";
  
  export type StartPaymentParams = {
    idToken: string;
  
    provider: PaymentProvider;
  
    paymentMethod: PaymentMethod;
  
    product: PaymentProduct;
  };
  
  export type StartPaymentResult = {
    provider: PaymentProvider;
  
    providerPurchaseId: string;
  
    checkoutUrl: string | null;
  };
  
  export async function startPayment(
    params: StartPaymentParams
  ): Promise<StartPaymentResult> {
    const response = await fetch(
      "/api/payments/create",
      {
        method: "POST",
  
        headers: {
          "Content-Type":
            "application/json",
  
          Authorization:
            `Bearer ${params.idToken}`,
        },
  
        body: JSON.stringify({
          provider:
            params.provider,
  
          paymentMethod:
            params.paymentMethod,
  
          product:
            params.product,
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error(
        "PAYMENT_CREATION_FAILED"
      );
    }
  
    return (
      await response.json()
    ) as StartPaymentResult;
  }