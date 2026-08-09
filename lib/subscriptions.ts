import {
    ENTITLEMENTS,
    type Entitlement,
  } from "./entitlements";
  
  export const SUBSCRIPTIONS = {
    DOST_PREMIUM: "dost-premium",
  } as const;
  
  export type SubscriptionId =
    (typeof SUBSCRIPTIONS)[keyof typeof SUBSCRIPTIONS];
  
  export type SubscriptionStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "CANCELED"
    | "EXPIRED";
  
  export type Subscription = {
    id: SubscriptionId;
    status: SubscriptionStatus;
  };
  
  const SUBSCRIPTION_ENTITLEMENTS: Record<
    SubscriptionId,
    Entitlement[]
  > = {
    [SUBSCRIPTIONS.DOST_PREMIUM]: [
      ENTITLEMENTS.HEAT_INPUT_PREMIUM,
      ENTITLEMENTS.REMOVE_ADS,
      ENTITLEMENTS.SAVE_CALCULATIONS,
      ENTITLEMENTS.PDF_EXPORT,
    ],
  };
  
  export function getSubscriptionEntitlements(
    subscriptionId: SubscriptionId
  ): Entitlement[] {
    return [
      ...SUBSCRIPTION_ENTITLEMENTS[
        subscriptionId
      ],
    ];
  }
  
  export function getActiveSubscriptionEntitlements(
    subscription: Subscription | null
  ): Entitlement[] {
    if (
      !subscription ||
      subscription.status !== "ACTIVE"
    ) {
      return [];
    }
  
    return getSubscriptionEntitlements(
      subscription.id
    );
  }