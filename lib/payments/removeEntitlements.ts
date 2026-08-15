import {
    getAdminFirestore,
  } from "../firebase-admin";
  
  import {
    getProductEntitlementGrant,
  } from "./entitlements";
  
  import type {
    PaymentProduct,
  } from "./types";
  
  export async function removeProductEntitlements(
    userId: string,
    product: PaymentProduct
  ): Promise<void> {
    const grant =
      getProductEntitlementGrant(
        product
      );
  
    if (
      grant.entitlements.length === 0
    ) {
      return;
    }
  
    const userReference =
      getAdminFirestore()
        .collection("users")
        .doc(userId);
  
    await getAdminFirestore().runTransaction(
      async (transaction) => {
        const snapshot =
          await transaction.get(
            userReference
          );
  
        if (!snapshot.exists) {
          return;
        }
  
        const currentData =
          snapshot.data();
  
        const currentEntitlements =
          Array.isArray(
            currentData?.entitlements
          )
            ? currentData.entitlements.filter(
                (
                  entitlement
                ): entitlement is string =>
                  typeof entitlement ===
                  "string"
              )
            : [];
  
        const remainingEntitlements =
          currentEntitlements.filter(
            (entitlement) =>
              !grant.entitlements.includes(
                entitlement
              )
          );
  
        transaction.set(
          userReference,
          {
            entitlements:
              remainingEntitlements,
  
            updatedAt:
              new Date(),
          },
          {
            merge: true,
          }
        );
      }
    );
  }