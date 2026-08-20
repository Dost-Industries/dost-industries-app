import {
    NextRequest,
  } from "next/server";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
  } from "vitest";

  const testState = vi.hoisted(() => {
    const userGet = vi.fn();
    const userSet = vi.fn();

    const subscriptionGet =
      vi.fn();

    const paymentGet = vi.fn();
    const refundPage = vi.fn();
    const chargebackPage =
      vi.fn();

    const syncSubscriptionAccess =
      vi.fn();

    const verifyIdToken =
      vi.fn();

    const userReference = {
      get: userGet,
      set: userSet,
      collection: vi.fn(),
    };

    const firestore = {
      collection: vi.fn(() => ({
        doc: vi.fn(
          () => userReference
        ),
      })),
      runTransaction: vi.fn(),
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
        page: vi.fn(),
        create: vi.fn(),
      },
      customerMandates: {
        get: vi.fn(),
      },
    };

    return {
      userGet,
      userSet,
      subscriptionGet,
      paymentGet,
      refundPage,
      chargebackPage,
      syncSubscriptionAccess,
      verifyIdToken,
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
      Timestamp: {
        fromDate: (
          date: Date
        ) => date,
      },
    })
  );

  vi.mock(
    "../lib/firebase-admin",
    () => ({
      getAdminFirestore: () =>
        testState.firestore,
      getAdminAuth: () => ({
        verifyIdToken:
          testState.verifyIdToken,
      }),
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
    "../lib/payments/catalog",
    () => ({
      getPaymentProduct: () => ({
        type: "subscription",
        currency: "EUR",
        amount: 4.99,
      }),
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

  import {
    POST as activatePost,
  } from "../app/api/subscriptions/mollie/activate/route";

  const USER_ID = "user-pay005";
  const CUSTOMER_ID = "cst_pay005";
  const PAYMENT_ID = "tr_pay005";
  const SUBSCRIPTION_ID =
    "sub_pay005";

  function createPremiumPayment() {
    return {
      id: PAYMENT_ID,
      status: "paid",
      subscriptionId: null,
      customerId: CUSTOMER_ID,
      mandateId: "mdt_pay005",
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
          "dost-premium-first-payment",
        customerId:
          CUSTOMER_ID,
      },
    };
  }

  function setUserBilling(
    extra: Record<
      string,
      unknown
    > = {}
  ) {
    testState.userGet.mockResolvedValue(
      {
        exists: true,
        data: () => ({
          billing: {
            mollieCustomerId:
              CUSTOMER_ID,
            premiumFirstPaymentId:
              PAYMENT_ID,
            ...extra,
          },
        }),
      }
    );
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

  function createActivateRequest():
  NextRequest {
  return new NextRequest(
      "http://localhost/api/subscriptions/mollie/activate",
      {
        method: "POST",
        headers: {
          authorization:
            "Bearer test-token",
        },
      }
    );
  }

  describe(
    "PAY-005 Premium financial revocation",
    () => {
      beforeEach(() => {
        vi.clearAllMocks();

        testState.paymentGet
          .mockResolvedValue(
            createPremiumPayment()
          );

        testState.refundPage
          .mockResolvedValue([]);

        testState.chargebackPage
          .mockResolvedValue([]);

        testState.verifyIdToken
          .mockResolvedValue({
            uid: USER_ID,
          });

        testState.subscriptionGet
          .mockResolvedValue({
            id: SUBSCRIPTION_ID,
            status: "active",
            startDate:
              "2026-09-20",
          });

        setUserBilling();
      });

      it(
        "revokes Premium when the first payment is fully refunded",
        async () => {
          testState.refundPage
            .mockResolvedValue([
              {
                id: "re_full",
                status: "refunded",
                amount: {
                  currency: "EUR",
                  value: "4.99",
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
                "premium-first-payment-revoked",
              revoked: true,
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
            testState.userSet
          ).toHaveBeenCalledWith(
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
        "records a partial refund without revoking Premium",
        async () => {
          testState.refundPage
            .mockResolvedValue([
              {
                id: "re_partial",
                status: "refunded",
                amount: {
                  currency: "EUR",
                  value: "1.00",
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
                "premium-first-payment-reviewed",
              revoked: false,
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
          ).not.toHaveBeenCalled();

          expect(
            testState.userSet
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              billing:
                expect.objectContaining(
                  {
                    premiumLastRefundedAmount:
                      "1.00",
                    premiumLastRefundIsFull:
                      false,
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
        "blocks activation recovery when the first payment has an active chargeback",
        async () => {
          setUserBilling({
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          testState.chargebackPage
            .mockResolvedValue([
              {
                id:
                  "chb_active",
                reversedAt: null,
              },
            ]);

          const response =
            await activatePost(
              createActivateRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(409);

          expect(body).toMatchObject(
            {
              code:
                "PREMIUM_PAYMENT_REVOKED",
              revocationReason:
                "CHARGEBACK",
              activeChargebackCount:
                1,
            }
          );

          expect(
            testState.subscriptionGet
          ).not.toHaveBeenCalled();

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
        "allows activation recovery after only a partial refund",
        async () => {
          setUserBilling({
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          testState.refundPage
            .mockResolvedValue([
              {
                id:
                  "re_partial_recovery",
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
            await activatePost(
              createActivateRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(200);

          expect(body).toMatchObject(
            {
              activated: true,
              recovered: true,
              subscriptionId:
                SUBSCRIPTION_ID,
              subscriptionStatus:
                "active",
            }
          );

          expect(
            testState.subscriptionGet
          ).toHaveBeenCalledWith(
            SUBSCRIPTION_ID,
            {
              customerId:
                CUSTOMER_ID,
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
