import {
    getPaymentProduct,
  } from "./catalog";
  
  import {
    providerSupportsPaymentMethod,
  } from "./provider";
  
  import type {
    PaymentMethod,
    PaymentProduct,
    PaymentProvider,
    PaymentType,
  } from "./types";
  
  export type PaymentRequest = {
    provider: PaymentProvider;
    paymentMethod: PaymentMethod;
    product: PaymentProduct;
    type: PaymentType;
  };
  
  export type PaymentRequestValidationResult =
    | {
        valid: true;
      }
    | {
        valid: false;
        reason:
          | "invalid-payment-type"
          | "unsupported-payment-method"
          | "subscription-not-supported"
          | "one-time-payment-not-supported";
      };
  
  export function validatePaymentRequest(
    request: PaymentRequest
  ): PaymentRequestValidationResult {
    const product =
      getPaymentProduct(request.product);
  
    if (product.type !== request.type) {
      return {
        valid: false,
        reason: "invalid-payment-type",
      };
    }
  
    if (
      !providerSupportsPaymentMethod(
        request.provider,
        request.paymentMethod
      )
    ) {
      return {
        valid: false,
        reason: "unsupported-payment-method",
      };
    }
  
    if (
      request.type === "subscription" &&
      request.provider === "apple" &&
      request.paymentMethod !== "app-store"
    ) {
      return {
        valid: false,
        reason: "subscription-not-supported",
      };
    }
  
    if (
      request.type === "subscription" &&
      request.provider === "google" &&
      request.paymentMethod !== "google-play"
    ) {
      return {
        valid: false,
        reason: "subscription-not-supported",
      };
    }
  
    if (
      request.type === "one-time" &&
      request.provider === "apple" &&
      request.paymentMethod !== "app-store"
    ) {
      return {
        valid: false,
        reason: "one-time-payment-not-supported",
      };
    }
  
    if (
      request.type === "one-time" &&
      request.provider === "google" &&
      request.paymentMethod !== "google-play"
    ) {
      return {
        valid: false,
        reason: "one-time-payment-not-supported",
      };
    }
  
    return {
      valid: true,
    };
  }