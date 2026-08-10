import {
    PURCHASE_PROVIDERS,
    type PurchaseValidationRequest,
    type PurchaseValidationResult,
  } from "./purchase-validation";
  
  export async function validatePurchase(
    request: PurchaseValidationRequest
  ): Promise<PurchaseValidationResult> {
    switch (request.provider) {
      case PURCHASE_PROVIDERS.PAYPAL:
      case PURCHASE_PROVIDERS.APPLE:
      case PURCHASE_PROVIDERS.GOOGLE:
        return {
          valid: false,
          reason: "VALIDATION_UNAVAILABLE",
        };
  
      default:
        return {
          valid: false,
          reason: "UNSUPPORTED_PROVIDER",
        };
    }
  }