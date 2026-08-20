import {
    SUBSCRIPTIONS,
  } from "./subscriptions";

  export function hasActiveDostPremiumSubscription(
    value: unknown
  ): boolean {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return false;
    }

    const subscription =
      value as {
        id?: unknown;
        status?: unknown;
      };

    return (
      subscription.id ===
        SUBSCRIPTIONS.DOST_PREMIUM &&
      subscription.status ===
        "ACTIVE"
    );
  }
