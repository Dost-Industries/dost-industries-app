import {
    SUBSCRIPTIONS,
    type Subscription,
  } from "./subscriptions";
  
  export const PURCHASE_PROVIDERS = {
    PAYPAL: "paypal",
    APPLE: "apple",
    GOOGLE: "google",
  } as const;
  
  export type PurchaseProvider =
    (typeof PURCHASE_PROVIDERS)[keyof typeof PURCHASE_PROVIDERS];
  
  export type PurchaseValidationRequest = {
    provider: PurchaseProvider;
    purchaseId: string;
  };
  
  export type ValidatedPurchase = {
    provider: PurchaseProvider;
    purchaseId: string;
    productId: string;
    subscription: Subscription;
  };
  
  export type PurchaseValidationResult =
    | {
        valid: true;
        purchase: ValidatedPurchase;
      }
    | {
        valid: false;
        reason:
          | "UNSUPPORTED_PROVIDER"
          | "INVALID_PURCHASE"
          | "INACTIVE_PURCHASE"
          | "VALIDATION_UNAVAILABLE";
      };
  
  export function isPurchaseProvider(
    value: string
  ): value is PurchaseProvider {
    return Object.values(
      PURCHASE_PROVIDERS
    ).includes(
      value as PurchaseProvider
    );
  }
  
  export function createPremiumSubscription():
    Subscription {
    return {
      id: SUBSCRIPTIONS.DOST_PREMIUM,
      status: "ACTIVE",
    };
  }