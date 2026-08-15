import {
  molliePaymentService,
} from "./mollieService";

import {
  createUnsupportedPaymentService,
  type PaymentProviderService,
} from "./service";

import type {
  PaymentProvider,
} from "./types";

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
    molliePaymentService,

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