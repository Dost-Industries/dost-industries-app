import "server-only";

import {
  FieldValue,
  type Firestore,
} from "firebase-admin/firestore";

import {
  SUBSCRIPTIONS,
} from "./subscriptions";

import {
  syncSubscriptionAccess,
} from "./subscription-access";

export type SubscriptionReconciliationReason =
  | "PROFILE_MISSING"
  | "NO_DOST_PREMIUM"
  | "NOT_ACTIVE"
  | "NO_SCHEDULED_CANCELLATION"
  | "ACCESS_PERIOD_ACTIVE"
  | "CANCELED_PERIOD_ENDED";

export type SubscriptionReconciliationResult = {
  changed: boolean;
  reason: SubscriptionReconciliationReason;
  accessUntil: Date | null;
};

function readString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function readBoolean(
  value: unknown
): boolean | null {
  return typeof value ===
    "boolean"
    ? value
    : null;
}

function readProfileSubscription(
  data:
    | Record<string, unknown>
    | undefined
): {
  id: string | null;
  status: string | null;
} {
  if (!data) {
    return {
      id: null,
      status: null,
    };
  }

  const subscription =
    data.subscription;

  if (
    typeof subscription !== "object" ||
    subscription === null
  ) {
    return {
      id: null,
      status: null,
    };
  }

  const record =
    subscription as Record<
      string,
      unknown
    >;

  return {
    id:
      readString(
        record.id
      ),

    status:
      readString(
        record.status
      ),
  };
}

function readBillingValue(
  data:
    | Record<string, unknown>
    | undefined,
  key: string
): unknown {
  if (!data) {
    return undefined;
  }

  const billing =
    data.billing;

  if (
    typeof billing !== "object" ||
    billing === null
  ) {
    return undefined;
  }

  return (
    billing as Record<
      string,
      unknown
    >
  )[key];
}

function toDate(
  value: unknown
): Date | null {
  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    const converted =
      (
        value as {
          toDate: () => Date;
        }
      ).toDate();

    return Number.isNaN(
      converted.getTime()
    )
      ? null
      : converted;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      new Date(value);

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  }

  return null;
}

/**
 * Reconciles the compact DOST Premium access state with a
 * previously scheduled cancellation.
 *
 * Important:
 * - Mollie billing may already be canceled while DOST Premium
 *   intentionally remains ACTIVE through the paid period.
 * - We only revoke that retained access when the stored paid
 *   period has actually ended.
 * - A normal active recurring subscription is NOT expired here
 *   merely because a locally stored date is stale. Recurring
 *   payment/webhook handling remains responsible for that flow.
 */
export async function reconcileDostPremiumAccess(
  db: Firestore,
  uid: string,
  now: Date = new Date()
): Promise<SubscriptionReconciliationResult> {
  const userReference =
    db
      .collection("users")
      .doc(uid);

  const userSnapshot =
    await userReference.get();

  if (!userSnapshot.exists) {
    return {
      changed: false,
      reason:
        "PROFILE_MISSING",
      accessUntil: null,
    };
  }

  const userData =
    userSnapshot.data();

  const currentSubscription =
    readProfileSubscription(
      userData
    );

  if (
    currentSubscription.id !==
      SUBSCRIPTIONS.DOST_PREMIUM
  ) {
    return {
      changed: false,
      reason:
        "NO_DOST_PREMIUM",
      accessUntil: null,
    };
  }

  if (
    currentSubscription.status !==
      "ACTIVE"
  ) {
    return {
      changed: false,
      reason:
        "NOT_ACTIVE",
      accessUntil:
        toDate(
          readBillingValue(
            userData,
            "premiumAccessUntil"
          )
        ),
    };
  }

  const providerStatus =
    readString(
      readBillingValue(
        userData,
        "mollieSubscriptionStatus"
      )
    );

  const cancelAtPeriodEnd =
    readBoolean(
      readBillingValue(
        userData,
        "premiumCancelAtPeriodEnd"
      )
    ) === true;

  const accessUntil =
    toDate(
      readBillingValue(
        userData,
        "premiumAccessUntil"
      )
    );

  /*
   * Only the deliberate cancel-at-period-end flow is expired
   * here. This prevents a stale local period date from revoking
   * a subscription that Mollie still considers active.
   */
  if (
    providerStatus !==
      "canceled" ||
    !cancelAtPeriodEnd ||
    !accessUntil
  ) {
    return {
      changed: false,
      reason:
        "NO_SCHEDULED_CANCELLATION",
      accessUntil,
    };
  }

  if (
    accessUntil.getTime() >
      now.getTime()
  ) {
    return {
      changed: false,
      reason:
        "ACCESS_PERIOD_ACTIVE",
      accessUntil,
    };
  }

  /*
   * The user canceled future billing and the period they already
   * paid for has now ended. CANCELED is therefore the correct
   * compact DOST status. EXPIRED remains available for a future
   * natural/provider-driven expiry flow.
   *
   * syncSubscriptionAccess also derives the correct entitlement
   * set, so Premium entitlements are removed in the same access
   * transition.
   */
  await syncSubscriptionAccess(
    db,
    uid,
    {
      id:
        SUBSCRIPTIONS.DOST_PREMIUM,

      status:
        "CANCELED",
    }
  );

  /*
   * Audit marker only. The historical premiumAccessUntil and
   * cancellation fields are deliberately preserved.
   */
  await userReference.update({
    "billing.premiumAccessExpiredAt":
      FieldValue.serverTimestamp(),

    updatedAt:
      FieldValue.serverTimestamp(),
  });

  return {
    changed: true,
    reason:
      "CANCELED_PERIOD_ENDED",
    accessUntil,
  };
}
