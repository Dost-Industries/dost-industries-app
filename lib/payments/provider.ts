import type {
    PaymentMethod,
    PaymentProvider,
  } from "./types";
  
  export type ProviderCapabilities = {
    subscriptions: boolean;
    oneTimePayments: boolean;
    creditCard: boolean;
    debitCard: boolean;
    paypal: boolean;
    ideal: boolean;
    applePay: boolean;
    googlePay: boolean;
    appStoreBilling: boolean;
    googlePlayBilling: boolean;
  };
  
  export const PAYMENT_PROVIDER_CAPABILITIES: Record<
    PaymentProvider,
    ProviderCapabilities
  > = {
    paypal: {
      subscriptions: true,
      oneTimePayments: true,
      creditCard: true,
      debitCard: true,
      paypal: true,
      ideal: false,
      applePay: false,
      googlePay: false,
      appStoreBilling: false,
      googlePlayBilling: false,
    },
  
    stripe: {
      subscriptions: true,
      oneTimePayments: true,
      creditCard: true,
      debitCard: true,
      paypal: false,
      ideal: true,
      applePay: true,
      googlePay: true,
      appStoreBilling: false,
      googlePlayBilling: false,
    },
  
    mollie: {
      subscriptions: true,
      oneTimePayments: true,
      creditCard: true,
      debitCard: true,
      paypal: true,
      ideal: true,
      applePay: true,
      googlePay: false,
      appStoreBilling: false,
      googlePlayBilling: false,
    },
  
    apple: {
      subscriptions: true,
      oneTimePayments: true,
      creditCard: false,
      debitCard: false,
      paypal: false,
      ideal: false,
      applePay: false,
      googlePay: false,
      appStoreBilling: true,
      googlePlayBilling: false,
    },
  
    google: {
      subscriptions: true,
      oneTimePayments: true,
      creditCard: false,
      debitCard: false,
      paypal: false,
      ideal: false,
      applePay: false,
      googlePay: false,
      appStoreBilling: false,
      googlePlayBilling: true,
    },
  };
  
  export function providerSupportsPaymentMethod(
    provider: PaymentProvider,
    paymentMethod: PaymentMethod
  ): boolean {
    const capabilities =
      PAYMENT_PROVIDER_CAPABILITIES[provider];
  
    switch (paymentMethod) {
      case "paypal":
        return capabilities.paypal;
  
      case "credit-card":
        return capabilities.creditCard;
  
      case "debit-card":
        return capabilities.debitCard;
  
      case "apple-pay":
        return capabilities.applePay;
  
      case "google-pay":
        return capabilities.googlePay;
  
      case "ideal":
        return capabilities.ideal;
  
      case "app-store":
        return capabilities.appStoreBilling;
  
      case "google-play":
        return capabilities.googlePlayBilling;
  
      case "bank-transfer":
      case "other":
        return false;
    }
  }