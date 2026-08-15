import {
  applyProductEntitlements,
} from "./applyEntitlements";

import {
  createSubscriptionRecord,
} from "./records";

import {
  saveSubscriptionRecordServer,
} from "./serverStorage";

import type {
  PaymentMethod,
  PaymentProvider,
  SubscriptionStatus,
} from "./types";

export type ProcessSubscriptionParams = {
  id: string;

  userId: string;

  provider: PaymentProvider;

  paymentMethod: PaymentMethod;

  providerSubscriptionId: string;

  status: SubscriptionStatus;

  currentPeriodStart?: Date | null;

  currentPeriodEnd?: Date | null;
};

export async function processSubscription(
  params: ProcessSubscriptionParams
): Promise<void> {
  const subscription =
    createSubscriptionRecord({
      id: params.id,

      userId:
        params.userId,

      provider:
        params.provider,

      paymentMethod:
        params.paymentMethod,

      providerSubscriptionId:
        params.providerSubscriptionId,

      status:
        params.status,

      currentPeriodStart:
        params.currentPeriodStart ?? null,

      currentPeriodEnd:
        params.currentPeriodEnd ?? null,
    });

  await saveSubscriptionRecordServer(
    subscription
  );

  if (params.status === "active") {
    await applyProductEntitlements(
      params.userId,
      "dost-premium-monthly"
    );
  }
}