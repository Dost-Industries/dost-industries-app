import type {
    PaymentMethod,
    PaymentProduct,
    PaymentProvider,
    PaymentStatus,
    PaymentType,
    PurchaseRecord,
    SubscriptionRecord,
    SubscriptionStatus,
  } from "./types";
  
  export function createPurchaseRecord(params: {
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
    createdAt?: Date;
    updatedAt?: Date;
  }): PurchaseRecord {
    const createdAt =
      params.createdAt ?? new Date();
  
    const updatedAt =
      params.updatedAt ?? createdAt;
  
    return {
      id: params.id,
      userId: params.userId,
      provider: params.provider,
      paymentMethod: params.paymentMethod,
      providerPurchaseId:
        params.providerPurchaseId,
      product: params.product,
      type: params.type,
      status: params.status,
      amount: params.amount,
      currency: params.currency,
      createdAt,
      updatedAt,
    };
  }
  
  export function createSubscriptionRecord(params: {
    id: string;
    userId: string;
    provider: PaymentProvider;
    paymentMethod: PaymentMethod;
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): SubscriptionRecord {
    const createdAt =
      params.createdAt ?? new Date();
  
    const updatedAt =
      params.updatedAt ?? createdAt;
  
    return {
      id: params.id,
      userId: params.userId,
      provider: params.provider,
      paymentMethod: params.paymentMethod,
      providerSubscriptionId:
        params.providerSubscriptionId,
      product: "dost-premium-monthly",
      status: params.status,
      currentPeriodStart:
        params.currentPeriodStart ?? null,
      currentPeriodEnd:
        params.currentPeriodEnd ?? null,
      createdAt,
      updatedAt,
    };
  }