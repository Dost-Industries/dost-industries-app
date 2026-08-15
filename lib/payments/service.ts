import type {
    PaymentMethod,
    PaymentProduct,
    PaymentProvider,
    PaymentValidationResult,
  } from "./types";
  
  export type CreatePaymentRequest = {
    userId: string;
    provider: PaymentProvider;
    paymentMethod: PaymentMethod;
    product: PaymentProduct;
  };
  
  export type CreatedPayment = {
    provider: PaymentProvider;
    providerPurchaseId: string;
    checkoutUrl: string | null;
  };
  
  export type PaymentProviderService = {
    createPayment(
      request: CreatePaymentRequest
    ): Promise<CreatedPayment>;
  
    validatePurchase(
      userId: string,
      providerPurchaseId: string,
      product: PaymentProduct
    ): Promise<PaymentValidationResult>;
  };
  
  export function createUnsupportedPaymentService(
    provider: PaymentProvider
  ): PaymentProviderService {
    return {
      async createPayment() {
        throw new Error(
          `PAYMENT_PROVIDER_NOT_CONFIGURED:${provider}`
        );
      },
  
      async validatePurchase() {
        return {
          valid: false,
          reason: "provider-error",
        };
      },
    };
  }