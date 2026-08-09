import "server-only";

import {
  FieldValue,
  type Firestore,
} from "firebase-admin/firestore";

import {
  getActiveSubscriptionEntitlements,
  type Subscription,
} from "./subscriptions";

export async function syncSubscriptionAccess(
  db: Firestore,
  uid: string,
  subscription: Subscription | null
): Promise<void> {
  const entitlements =
    getActiveSubscriptionEntitlements(
      subscription
    );

  await db
    .collection("users")
    .doc(uid)
    .set(
      {
        entitlements,
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              updatedAt:
                FieldValue.serverTimestamp(),
            }
          : null,
      },
      {
        merge: true,
      }
    );
}