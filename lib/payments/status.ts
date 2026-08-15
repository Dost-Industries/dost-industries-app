import type {
    PaymentStatus,
    SubscriptionStatus,
  } from "./types";
  
  export function isSuccessfulPaymentStatus(
    status: PaymentStatus
  ): boolean {
    return status === "completed";
  }
  
  export function isTerminalPaymentStatus(
    status: PaymentStatus
  ): boolean {
    return (
      status === "completed" ||
      status === "failed" ||
      status === "cancelled" ||
      status === "refunded"
    );
  }
  
  export function hasActiveSubscriptionStatus(
    status: SubscriptionStatus
  ): boolean {
    return status === "active";
  }
  
  export function isTerminalSubscriptionStatus(
    status: SubscriptionStatus
  ): boolean {
    return (
      status === "cancelled" ||
      status === "expired"
    );
  }