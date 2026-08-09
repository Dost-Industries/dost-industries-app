import {
    describe,
    expect,
    test,
  } from "vitest";
  
  import {
    ENTITLEMENTS,
  } from "../lib/entitlements";
  
  import {
    getActiveSubscriptionEntitlements,
    getSubscriptionEntitlements,
    SUBSCRIPTIONS,
    type Subscription,
  } from "../lib/subscriptions";
  
  describe("DOST subscription logic", () => {
    test(
      "DOST Premium contains all current premium entitlements",
      () => {
        const entitlements =
          getSubscriptionEntitlements(
            SUBSCRIPTIONS.DOST_PREMIUM
          );
  
        expect(entitlements).toEqual([
          ENTITLEMENTS.HEAT_INPUT_PREMIUM,
          ENTITLEMENTS.REMOVE_ADS,
          ENTITLEMENTS.SAVE_CALCULATIONS,
          ENTITLEMENTS.PDF_EXPORT,
        ]);
      }
    );
  
    test(
      "an active DOST Premium subscription grants premium entitlements",
      () => {
        const subscription: Subscription = {
          id: SUBSCRIPTIONS.DOST_PREMIUM,
          status: "ACTIVE",
        };
  
        expect(
          getActiveSubscriptionEntitlements(
            subscription
          )
        ).toEqual([
          ENTITLEMENTS.HEAT_INPUT_PREMIUM,
          ENTITLEMENTS.REMOVE_ADS,
          ENTITLEMENTS.SAVE_CALCULATIONS,
          ENTITLEMENTS.PDF_EXPORT,
        ]);
      }
    );
  
    test.each([
      "INACTIVE",
      "CANCELED",
      "EXPIRED",
    ] as const)(
      "%s DOST Premium grants no entitlements",
      (status) => {
        const subscription: Subscription = {
          id: SUBSCRIPTIONS.DOST_PREMIUM,
          status,
        };
  
        expect(
          getActiveSubscriptionEntitlements(
            subscription
          )
        ).toEqual([]);
      }
    );
  
    test(
      "no subscription grants no entitlements",
      () => {
        expect(
          getActiveSubscriptionEntitlements(null)
        ).toEqual([]);
      }
    );
  
    test(
      "returned entitlement arrays cannot mutate the subscription definition",
      () => {
        const first =
          getSubscriptionEntitlements(
            SUBSCRIPTIONS.DOST_PREMIUM
          );
  
        first.pop();
  
        const second =
          getSubscriptionEntitlements(
            SUBSCRIPTIONS.DOST_PREMIUM
          );
  
        expect(second).toHaveLength(4);
        expect(second).toContain(
          ENTITLEMENTS.PDF_EXPORT
        );
      }
    );
  });