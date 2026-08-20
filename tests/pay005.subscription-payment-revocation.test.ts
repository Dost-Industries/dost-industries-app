import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const testState = vi.hoisted(() => {
  const paymentGet = vi.fn();
  const refundPage = vi.fn();
  const chargebackPage =
    vi.fn();

  const subscriptionGet =
    vi.fn();

  const userGet = vi.fn();
  const subscriptionDocGet =
    vi.fn();

  const transactionSet =
    vi.fn();

  const syncSubscriptionAccess =
    vi.fn();

  const subscriptionReference = {
    get: subscriptionDocGet,
  };

  const userReference = {
    get: userGet,
    collection: vi.fn(
      (name: string) => {
        if (
          name !==
          "subscriptions"
        ) {
          throw new Error(
            `Unexpected collection: ${name}`
          );
        }

        return {
          doc: vi.fn(
            () =>
              subscriptionReference
          ),
        };
      }
    ),
  };

  const firestore = {
    collection: vi.fn(
      (name: string) => {
        if (name !== "users") {
          throw new Error(
            `Unexpected root collection: ${name}`
          );
        }

        return {
          doc: vi.fn(
            () => userReference
          ),
        };
      }
    ),

    runTransaction: vi.fn(
      async (
        callback: (
          transaction: {
            set:
              typeof transactionSet;
          }
        ) => Promise<void>
      ) => {
        await callback({
          set:
            transactionSet,
        });
      }
    ),
  };

  const mollie = {
    payments: {
      get: paymentGet,
    },

    paymentRefunds: {
      page: refundPage,
    },

    paymentChargebacks: {
      page: chargebackPage,
    },

    customerSubscriptions: {
      get: subscriptionGet,
    },
  };

  return {
    paymentGet,
    refundPage,
    chargebackPage,
    subscriptionGet,
    userGet,
    subscriptionDocGet,
    transactionSet,
    syncSubscriptionAccess,
    subscriptionReference,
    userReference,
    firestore,
    mollie,
  };
});

vi.mock(
  "firebase-admin/firestore",
  () => ({
    FieldValue: {
      serverTimestamp: () => ({
        __operation:
          "serverTimestamp",
      }),
      delete: () => ({
        __operation: "delete",
      }),
    },

    Timestamp: class MockTimestamp {
      private readonly value: Date;

      constructor(
        value: Date
      ) {
        this.value = value;
      }

      toDate(): Date {
        return this.value;
      }

      static fromDate(
        date: Date
      ): MockTimestamp {
        return new MockTimestamp(
          date
        );
      }
    },
  })
);

vi.mock(
  "../lib/firebase-admin",
  () => ({
    getAdminFirestore: () =>
      testState.firestore,
  })
);

vi.mock(
  "../lib/payments/mollieClient",
  () => ({
    getMollieClient: () =>
      testState.mollie,
  })
);

vi.mock(
  "../lib/payments/molliePremiumService",
  () => ({
    MOLLIE_PREMIUM_FIRST_PAYMENT_FLOW:
      "dost-premium-first-payment",
  })
);

vi.mock(
  "../lib/subscription-access",
  () => ({
    syncSubscriptionAccess:
      testState.syncSubscriptionAccess,
  })
);

vi.mock(
  "../lib/subscriptions",
  () => ({
    SUBSCRIPTIONS: {
      DOST_PREMIUM:
        "dost-premium",
    },
  })
);

import {
  POST as webhookPost,
} from "../app/api/payments/mollie/webhook/route";

const USER_ID =
  "user-pay005-recurring";

const CUSTOMER_ID =
  "cst_pay005_recurring";

const PAYMENT_ID =
  "tr_pay005_recurring";

const SUBSCRIPTION_ID =
  "sub_pay005_recurring";

function createRecurringPayment() {
  return {
    id: PAYMENT_ID,
    status: "paid",
    subscriptionId:
      SUBSCRIPTION_ID,
    customerId:
      CUSTOMER_ID,
    paidAt:
      "2026-08-20T12:00:00Z",
    method: "ideal",
    amount: {
      currency: "EUR",
      value: "4.99",
    },
    metadata: {
      userId: USER_ID,
      product:
        "dost-premium-monthly",
      flow:
        "dost-premium-subscription",
    },
  };
}

function createSubscription() {
  return {
    id: SUBSCRIPTION_ID,
    status: "active",
    metadata: {
      userId: USER_ID,
      product:
        "dost-premium-monthly",
      flow:
        "dost-premium-subscription",
    },
  };
}

function createWebhookRequest():
  Request {
  const formData =
    new FormData();

  formData.set(
    "id",
    PAYMENT_ID
  );

  return new Request(
    "http://localhost/api/payments/mollie/webhook",
    {
      method: "POST",
      body: formData,
    }
  );
}

describe(
  "PAY-005 recurring Premium payment revocation",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      testState.paymentGet
        .mockResolvedValue(
          createRecurringPayment()
        );

      testState.subscriptionGet
        .mockResolvedValue(
          createSubscription()
        );

      testState.refundPage
        .mockResolvedValue([]);

      testState.chargebackPage
        .mockResolvedValue([]);

      testState.userGet
        .mockResolvedValue({
          exists: true,
          data: () => ({
            billing: {
              mollieCustomerId:
                CUSTOMER_ID,
              mollieSubscriptionId:
                SUBSCRIPTION_ID,
            },
          }),
        });

      testState.subscriptionDocGet
        .mockResolvedValue({
          exists: true,
          data: () => ({
            currentPeriodStart:
              new Date(
                "2026-07-20T12:00:00Z"
              ),
            currentPeriodEnd:
              new Date(
                "2026-08-20T12:00:00Z"
              ),
            createdAt:
              new Date(
                "2026-06-20T12:00:00Z"
              ),
          }),
        });
    });

    it(
      "revokes Premium for a fully refunded recurring payment",
      async () => {
        testState.refundPage
          .mockResolvedValue([
            {
              id:
                "re_recurring_full",
              status:
                "refunded",
              amount: {
                currency:
                  "EUR",
                value:
                  "4.99",
              },
            },
          ]);

        const response =
          await webhookPost(
            createWebhookRequest()
          );

        const body =
          await response.json();

        expect(
          response.status
        ).toBe(200);

        expect(body).toMatchObject(
          {
            processed:
              "subscription-payment-revoked",
            paymentStatus:
              "paid",
            subscriptionStatus:
              "active",
            accessStatus:
              "INACTIVE",
            revocationReason:
              "REFUND",
            refundedAmount:
              "4.99",
            fullRefund: true,
          }
        );

        expect(
          testState
            .syncSubscriptionAccess
        ).toHaveBeenCalledWith(
          testState.firestore,
          USER_ID,
          {
            id:
              "dost-premium",
            status:
              "INACTIVE",
          }
        );

        expect(
          testState.transactionSet
        ).toHaveBeenCalledWith(
          testState.userReference,
          expect.objectContaining({
            billing:
              expect.objectContaining(
                {
                  premiumRevocationReason:
                    "REFUND",
                  premiumRevokedPaymentId:
                    PAYMENT_ID,
                  premiumLastRefundIsFull:
                    true,
                }
              ),
          }),
          {
            merge: true,
          }
        );
      }
    );

    it(
      "keeps Premium active after only a partial recurring refund",
      async () => {
        testState.refundPage
          .mockResolvedValue([
            {
              id:
                "re_recurring_partial",
              status:
                "refunded",
              amount: {
                currency:
                  "EUR",
                value:
                  "1.00",
              },
            },
          ]);

        const response =
          await webhookPost(
            createWebhookRequest()
          );

        const body =
          await response.json();

        expect(
          response.status
        ).toBe(200);

        expect(body).toMatchObject(
          {
            processed:
              "subscription-payment",
            accessStatus:
              "ACTIVE",
            revocationReason:
              null,
            refundedAmount:
              "1.00",
            fullRefund: false,
          }
        );

        expect(
          testState
            .syncSubscriptionAccess
        ).toHaveBeenCalledWith(
          testState.firestore,
          USER_ID,
          {
            id:
              "dost-premium",
            status:
              "ACTIVE",
          }
        );
      }
    );

    it(
      "revokes Premium for an active recurring chargeback",
      async () => {
        testState.chargebackPage
          .mockResolvedValue([
            {
              id:
                "chb_recurring_active",
              reversedAt: null,
            },
          ]);

        const response =
          await webhookPost(
            createWebhookRequest()
          );

        const body =
          await response.json();

        expect(
          response.status
        ).toBe(200);

        expect(body).toMatchObject(
          {
            processed:
              "subscription-payment-revoked",
            accessStatus:
              "INACTIVE",
            revocationReason:
              "CHARGEBACK",
            activeChargebackCount:
              1,
          }
        );

        expect(
          testState
            .syncSubscriptionAccess
        ).toHaveBeenCalledWith(
          testState.firestore,
          USER_ID,
          {
            id:
              "dost-premium",
            status:
              "INACTIVE",
          }
        );
      }
    );

    it(
      "does not revoke Premium for a reversed chargeback",
      async () => {
        testState.chargebackPage
          .mockResolvedValue([
            {
              id:
                "chb_recurring_reversed",
              reversedAt:
                "2026-08-21T10:00:00Z",
            },
          ]);

        const response =
          await webhookPost(
            createWebhookRequest()
          );

        const body =
          await response.json();

        expect(
          response.status
        ).toBe(200);

        expect(body).toMatchObject(
          {
            processed:
              "subscription-payment",
            accessStatus:
              "ACTIVE",
            revocationReason:
              null,
            activeChargebackCount:
              0,
          }
        );

        expect(
          testState
            .syncSubscriptionAccess
        ).toHaveBeenCalledWith(
          testState.firestore,
          USER_ID,
          {
            id:
              "dost-premium",
            status:
              "ACTIVE",
          }
        );
      }
    );
  }
);
