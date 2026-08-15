export type PaymentProvider =
  | "paypal"
  | "stripe"
  | "mollie"
  | "apple"
  | "google";

export type PaymentMethod =
  | "paypal"
  | "credit-card"
  | "debit-card"
  | "apple-pay"
  | "google-pay"
  | "ideal"
  | "bank-transfer"
  | "app-store"
  | "google-play"
  | "other";

export type PaymentProduct =
  | "dost-premium-monthly"
  | "professional-pdf-export";

export type PaymentType =
  | "subscription"
  | "one-time";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "past-due";

export type PurchaseRecord = {
  id: string;

  userId: string;

  provider: PaymentProvider;

  paymentMethod: PaymentMethod;

  providerPurchaseId: string;

  product: PaymentProduct;

  type: PaymentType;

  status: PaymentStatus;

  amount: number;

  currency: string;

  createdAt: Date;

  updatedAt: Date;
};

export type SubscriptionRecord = {
  id: string;

  userId: string;

  provider: PaymentProvider;

  paymentMethod: PaymentMethod;

  providerSubscriptionId: string;

  product: "dost-premium-monthly";

  status: SubscriptionStatus;

  currentPeriodStart: Date | null;

  currentPeriodEnd: Date | null;

  createdAt: Date;

  updatedAt: Date;
};

export type PdfExportCredit = {
  id: string;

  userId: string;

  sourcePurchaseId: string;

  consumed: boolean;

  consumedAt: Date | null;

  createdAt: Date;
};

export type PaymentValidationResult =
  | {
      valid: true;

      userId: string;

      provider: PaymentProvider;

      paymentMethod: PaymentMethod;

      product: PaymentProduct;

      providerPurchaseId: string;
    }
  | {
      valid: false;

      reason:
        | "invalid-purchase"
        | "wrong-user"
        | "wrong-product"
        | "already-processed"
        | "provider-error";
    };