import type {
    SubscriptionStatus,
  } from "./types";
  
  export type SubscriptionAccessState = {
    status: SubscriptionStatus;
  
    currentPeriodEnd: Date | null;
  };
  
  export function subscriptionHasAccess(
    subscription: SubscriptionAccessState,
    now: Date = new Date()
  ): boolean {
    switch (subscription.status) {
      case "active":
        return (
          subscription.currentPeriodEnd ===
            null ||
          subscription.currentPeriodEnd.getTime() >
            now.getTime()
        );
  
      case "cancelled":
        return (
          subscription.currentPeriodEnd !==
            null &&
          subscription.currentPeriodEnd.getTime() >
            now.getTime()
        );
  
      case "past-due":
        return (
          subscription.currentPeriodEnd !==
            null &&
          subscription.currentPeriodEnd.getTime() >
            now.getTime()
        );
  
      case "expired":
        return false;
    }
  }
  
  export function subscriptionAccessShouldBeRemoved(
    subscription: SubscriptionAccessState,
    now: Date = new Date()
  ): boolean {
    return !subscriptionHasAccess(
      subscription,
      now
    );
  }