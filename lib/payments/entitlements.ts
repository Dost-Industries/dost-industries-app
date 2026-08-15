import {
    ENTITLEMENTS,
  } from "../entitlements";
  
  import type {
    PaymentProduct,
  } from "./types";
  
  export type ProductEntitlementGrant = {
    entitlements: string[];
  
    pdfExportCredits: number;
  };
  
  export const PRODUCT_ENTITLEMENT_GRANTS: Record<
    PaymentProduct,
    ProductEntitlementGrant
  > = {
    "dost-premium-monthly": {
      entitlements: [
        ENTITLEMENTS.HEAT_INPUT_PREMIUM,
        ENTITLEMENTS.REMOVE_ADS,
        ENTITLEMENTS.SAVE_CALCULATIONS,
        ENTITLEMENTS.PDF_EXPORT,
      ],
  
      pdfExportCredits: 0,
    },
  
    "professional-pdf-export": {
      entitlements: [],
  
      pdfExportCredits: 1,
    },
  };
  
  export function getProductEntitlementGrant(
    product: PaymentProduct
  ): ProductEntitlementGrant {
    return PRODUCT_ENTITLEMENT_GRANTS[
      product
    ];
  }