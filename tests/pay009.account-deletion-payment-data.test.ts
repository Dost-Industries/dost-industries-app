import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
  } from "vitest";

  import {
    NextRequest,
  } from "next/server";

  const testState = vi.hoisted(() => {
    const verifyIdToken =
      vi.fn();

    const deleteUser =
      vi.fn();

    const userGet =
      vi.fn();

    const recursiveDelete =
      vi.fn();

    const subscriptionGet =
      vi.fn();

    const subscriptionCancel =
      vi.fn();

    const userReference = {
      get: userGet,
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

      recursiveDelete,
    };

    const auth = {
      verifyIdToken,
      deleteUser,
    };

    const mollie = {
      customerSubscriptions: {
        get: subscriptionGet,
        cancel: subscriptionCancel,
      },
    };

    return {
      verifyIdToken,
      deleteUser,
      userGet,
      recursiveDelete,
      subscriptionGet,
      subscriptionCancel,
      userReference,
      firestore,
      auth,
      mollie,
    };
  });

  vi.mock(
    "../lib/firebase-admin",
    () => ({
      getAdminAuth: () =>
        testState.auth,
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

  import {
    DELETE as deleteAccount,
  } from "../app/api/account/delete/route";

  const USER_ID =
    "user-pay009";

  const CUSTOMER_ID =
    "cst_pay009";

  const SUBSCRIPTION_ID =
    "sub_pay009";

  function createDeleteRequest():
    NextRequest {
    return new NextRequest(
      "http://localhost/api/account/delete",
      {
        method: "DELETE",
        headers: {
          authorization:
            "Bearer test-token",
        },
      }
    );
  }

  function setUserBilling(
    billing:
      | Record<string, unknown>
      | null
  ) {
    testState.userGet
      .mockResolvedValue({
        exists: true,
        data: () =>
          billing
            ? {
                billing,
              }
            : {},
      });
  }

  function createSubscription(
    overrides:
      Partial<{
        id: string;
        status: string;
        metadata: Record<
          string,
          unknown
        >;
      }> = {}
  ) {
    return {
      id:
        overrides.id ??
        SUBSCRIPTION_ID,

      status:
        overrides.status ??
        "active",

      metadata:
        overrides.metadata ??
        {
          userId:
            USER_ID,
          product:
            "dost-premium-monthly",
          flow:
            "dost-premium-subscription",
        },
    };
  }

  describe(
    "PAY-009 account deletion with payment-linked data",
    () => {
      beforeEach(() => {
        vi.clearAllMocks();

        testState.verifyIdToken
          .mockResolvedValue({
            uid: USER_ID,
          });

        testState.deleteUser
          .mockResolvedValue(
            undefined
          );

        testState.recursiveDelete
          .mockResolvedValue(
            undefined
          );

        testState.subscriptionGet
          .mockResolvedValue(
            createSubscription()
          );

        testState.subscriptionCancel
          .mockResolvedValue(
            createSubscription({
              status:
                "canceled",
            })
          );
      });

      it(
        "deletes an account with no linked Mollie subscription",
        async () => {
          setUserBilling(null);

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(200);

          expect(body).toEqual({
            success: true,
          });

          expect(
            testState.subscriptionGet
          ).not.toHaveBeenCalled();

          expect(
            testState.subscriptionCancel
          ).not.toHaveBeenCalled();

          expect(
            testState.recursiveDelete
          ).toHaveBeenCalledWith(
            testState.userReference
          );

          expect(
            testState.deleteUser
          ).toHaveBeenCalledWith(
            USER_ID
          );
        }
      );

      it(
        "cancels an active Mollie subscription before deleting the account",
        async () => {
          setUserBilling({
            mollieCustomerId:
              CUSTOMER_ID,
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(200);

          expect(body).toEqual({
            success: true,
          });

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
            testState.subscriptionCancel
          ).toHaveBeenCalledWith(
            SUBSCRIPTION_ID,
            {
              customerId:
                CUSTOMER_ID,
            }
          );

          const cancelOrder =
            testState.subscriptionCancel
              .mock
              .invocationCallOrder[0];

          const deleteOrder =
            testState.recursiveDelete
              .mock
              .invocationCallOrder[0];

          const authDeleteOrder =
            testState.deleteUser
              .mock
              .invocationCallOrder[0];

          expect(
            cancelOrder
          ).toBeLessThan(
            deleteOrder
          );

          expect(
            deleteOrder
          ).toBeLessThan(
            authDeleteOrder
          );
        }
      );

      it(
        "deletes an account without sending a second cancel when Mollie already reports canceled",
        async () => {
          setUserBilling({
            mollieCustomerId:
              CUSTOMER_ID,
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          testState.subscriptionGet
            .mockResolvedValue(
              createSubscription({
                status:
                  "canceled",
              })
            );

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          expect(
            response.status
          ).toBe(200);

          expect(
            testState.subscriptionCancel
          ).not.toHaveBeenCalled();

          expect(
            testState.recursiveDelete
          ).toHaveBeenCalledWith(
            testState.userReference
          );

          expect(
            testState.deleteUser
          ).toHaveBeenCalledWith(
            USER_ID
          );
        }
      );

      it(
        "refuses deletion when the linked Mollie subscription belongs to another account",
        async () => {
          setUserBilling({
            mollieCustomerId:
              CUSTOMER_ID,
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          testState.subscriptionGet
            .mockResolvedValue(
              createSubscription({
                metadata: {
                  userId:
                    "different-user",
                  product:
                    "dost-premium-monthly",
                  flow:
                    "dost-premium-subscription",
                },
              })
            );

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(403);

          expect(body).toMatchObject(
            {
              code:
                "ACCOUNT_DELETE_SUBSCRIPTION_MISMATCH",
            }
          );

          expect(
            testState.subscriptionCancel
          ).not.toHaveBeenCalled();

          expect(
            testState.recursiveDelete
          ).not.toHaveBeenCalled();

          expect(
            testState.deleteUser
          ).not.toHaveBeenCalled();
        }
      );

      it(
        "refuses deletion when a linked subscription has no stored customer identity",
        async () => {
          setUserBilling({
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(409);

          expect(body).toMatchObject(
            {
              code:
                "ACCOUNT_DELETE_BILLING_IDENTITY_INCOMPLETE",
            }
          );

          expect(
            testState.subscriptionGet
          ).not.toHaveBeenCalled();

          expect(
            testState.recursiveDelete
          ).not.toHaveBeenCalled();

          expect(
            testState.deleteUser
          ).not.toHaveBeenCalled();
        }
      );

      it(
        "refuses deletion when Mollie does not confirm cancellation",
        async () => {
          setUserBilling({
            mollieCustomerId:
              CUSTOMER_ID,
            mollieSubscriptionId:
              SUBSCRIPTION_ID,
          });

          testState.subscriptionCancel
            .mockResolvedValue(
              createSubscription({
                status:
                  "active",
              })
            );

          const response =
            await deleteAccount(
              createDeleteRequest()
            );

          const body =
            await response.json();

          expect(
            response.status
          ).toBe(409);

          expect(body).toMatchObject(
            {
              code:
                "ACCOUNT_DELETE_CANCELLATION_NOT_CONFIRMED",
            }
          );

          expect(
            testState.recursiveDelete
          ).not.toHaveBeenCalled();

          expect(
            testState.deleteUser
          ).not.toHaveBeenCalled();
        }
      );
    }
  );
