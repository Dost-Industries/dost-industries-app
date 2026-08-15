import type {
    PaymentProduct,
    PaymentType,
  } from "./types";
  
  export type PaymentProductDefinition = {
    id: PaymentProduct;
  
    name: string;
  
    description: string;
  
    type: PaymentType;
  
    amount: number;
  
    currency: "EUR";
  
    recurringInterval:
      | "month"
      | null;
  
    grants: {
      premiumAccess: boolean;
      pdfExportCredits: number | null;
    };
  };
  
  export const PAYMENT_PRODUCTS: Record<
    PaymentProduct,
    PaymentProductDefinition
  > = {
    "dost-premium-monthly": {
      id: "dost-premium-monthly",
  
      name: "DOST Premium",
  
      description:
        "Monthly DOST Premium subscription.",
  
      type: "subscription",
  
      amount: 4.99,
  
      currency: "EUR",
  
      recurringInterval: "month",
  
      grants: {
        premiumAccess: true,
        pdfExportCredits: null,
      },
    },
  
    "professional-pdf-export": {
      id: "professional-pdf-export",
  
      name: "Professional PDF Export",
  
      description:
        "One professional PDF export without subscription.",
  
      type: "one-time",
  
      amount: 1.29,
  
      currency: "EUR",
  
      recurringInterval: null,
  
      grants: {
        premiumAccess: false,
        pdfExportCredits: 1,
      },
    },
  };
  
  export function getPaymentProduct(
    productId: PaymentProduct
  ): PaymentProductDefinition {
    return PAYMENT_PRODUCTS[productId];
  }