import {
    describe,
    expect,
    test,
  } from "vitest";
  
  import {
    PURCHASE_PROVIDERS,
    createPremiumSubscription,
    isPurchaseProvider,
  } from "../lib/purchase-validation";
  
  import {
    validatePurchase,
  } from "../lib/validate-purchase";
  
  describe(
    "purchase validation",
    () => {
      test(
        "recognizes supported purchase providers",
        () => {
          expect(
            isPurchaseProvider("paypal")
          ).toBe(true);
  
          expect(
            isPurchaseProvider("apple")
          ).toBe(true);
  
          expect(
            isPurchaseProvider("google")
          ).toBe(true);
  
          expect(
            isPurchaseProvider("unknown")
          ).toBe(false);
        }
      );
  
      test(
        "creates an active DOST Premium subscription",
        () => {
          expect(
            createPremiumSubscription()
          ).toEqual({
            id: "dost-premium",
            status: "ACTIVE",
          });
        }
      );
  
      test(
        "fails closed for PayPal until provider validation exists",
        async () => {
          const result =
            await validatePurchase({
              provider:
                PURCHASE_PROVIDERS.PAYPAL,
              purchaseId:
                "test-paypal-purchase",
            });
  
          expect(result).toEqual({
            valid: false,
            reason:
              "VALIDATION_UNAVAILABLE",
          });
        }
      );
  
      test(
        "fails closed for Apple until provider validation exists",
        async () => {
          const result =
            await validatePurchase({
              provider:
                PURCHASE_PROVIDERS.APPLE,
              purchaseId:
                "test-apple-purchase",
            });
  
          expect(result).toEqual({
            valid: false,
            reason:
              "VALIDATION_UNAVAILABLE",
          });
        }
      );
  
      test(
        "fails closed for Google until provider validation exists",
        async () => {
          const result =
            await validatePurchase({
              provider:
                PURCHASE_PROVIDERS.GOOGLE,
              purchaseId:
                "test-google-purchase",
            });
  
          expect(result).toEqual({
            valid: false,
            reason:
              "VALIDATION_UNAVAILABLE",
          });
        }
      );
    }
  );