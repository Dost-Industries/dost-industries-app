import type {
    PaymentProvider,
  } from "./types";
  
  import {
    createUnsupportedPaymentService,
    type PaymentProviderService,
  } from "./service";
  
  const providerServices: Record<
    PaymentProvider,
    PaymentProviderService
  > = {
    paypal:
      createUnsupportedPaymentService(
        "paypal"
      ),
  
    stripe:
      createUnsupportedPaymentService(
        "stripe"
      ),
  
    mollie:
      createUnsupportedPaymentService(
        "mollie"
      ),
  
    apple:
      createUnsupportedPaymentService(
        "apple"
      ),
  
    google:
      createUnsupportedPaymentService(
        "google"
      ),
  };
  
  export function getPaymentProviderService(
    provider: PaymentProvider
  ): PaymentProviderService {
    return providerServices[provider];
  }
  
  export function setPaymentProviderService(
    provider: PaymentProvider,
    service: PaymentProviderService
  ): void {
    providerServices[provider] =
      service;
  }