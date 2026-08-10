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
    SUBSCRIPTIONS,
  } from "../lib/subscriptions";
  
  describe(
    "DOST Premium access integration",
    () => {
      test(
        "an active DOST Premium subscription grants all required premium entitlements",
        () => {
          const entitlements =
            getActiveSubscriptionEntitlements({
              id:
                SUBSCRIPTIONS.DOST_PREMIUM,
              status: "ACTIVE",
            });
  
          expect(entitlements).toEqual(
            expect.arrayContaining([
              ENTITLEMENTS.HEAT_INPUT_PREMIUM,
              ENTITLEMENTS.REMOVE_ADS,
              ENTITLEMENTS.SAVE_CALCULATIONS,
              ENTITLEMENTS.PDF_EXPORT,
            ])
          );
  
          expect(entitlements).toHaveLength(4);
        }
      );
  
      test.each([
        "INACTIVE",
        "CANCELED",
        "EXPIRED",
      ] as const)(
        "%s DOST Premium grants no entitlements",
        (status) => {
          const entitlements =
            getActiveSubscriptionEntitlements({
              id:
                SUBSCRIPTIONS.DOST_PREMIUM,
              status,
            });
  
          expect(entitlements).toEqual([]);
        }
      );
  
      test(
        "no subscription grants no premium entitlements",
        () => {
          expect(
            getActiveSubscriptionEntitlements(
              null
            )
          ).toEqual([]);
        }
      );
    }
  );