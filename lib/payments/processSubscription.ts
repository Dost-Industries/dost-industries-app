import {
  applyProductEntitlements,
} from "./applyEntitlements";

import {
  removeProductEntitlements,
} from "./removeEntitlements";

import {
  createSubscriptionRecord,
} from "./records";

import {
  saveSubscriptionRecordServer,
} from "./serverStorage";

import {
  subscriptionHasAccess,
} from "./subscriptionLifecycle";

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
  const currentPeriodStart =
    params.currentPeriodStart ?? null;

  const currentPeriodEnd =
    params.currentPeriodEnd ?? null;

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

      currentPeriodStart,

      currentPeriodEnd,
    });

  await saveSubscriptionRecordServer(
    subscription
  );

  const hasAccess =
    subscriptionHasAccess({
      status:
        params.status,

      currentPeriodEnd,
    });

  if (hasAccess) {
    await applyProductEntitlements(
      params.userId,
      "dost-premium-monthly"
    );

    return;
  }

  await removeProductEntitlements(
    params.userId,
    "dost-premium-monthly"
  );
}