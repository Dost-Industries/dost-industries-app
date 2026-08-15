import {
    getAdminFirestore,
  } from "../firebase-admin";
  
  import {
    getProductEntitlementGrant,
  } from "./entitlements";
  
  import type {
    PaymentProduct,
  } from "./types";
  
  export async function applyProductEntitlements(
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
  
        const currentData =
          snapshot.exists
            ? snapshot.data()
            : {};
  
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
  
        const mergedEntitlements =
          Array.from(
            new Set([
              ...currentEntitlements,
              ...grant.entitlements,
            ])
          );
  
        transaction.set(
          userReference,
          {
            entitlements:
              mergedEntitlements,
  
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