import {
    FieldValue,
    Timestamp,
    type Transaction,
  } from "firebase-admin/firestore";
  
  import {
    getAdminFirestore,
  } from "../firebase-admin";
  
  import type {
    PdfExportCredit,
    PurchaseRecord,
    SubscriptionRecord,
  } from "./types";
  
  function toFirestoreDate(
    value: Date
  ): Timestamp {
    return Timestamp.fromDate(value);
  }
  
  function getPurchaseReference(
    userId: string,
    purchaseId: string
  ) {
    return getAdminFirestore()
      .collection("users")
      .doc(userId)
      .collection("purchases")
      .doc(purchaseId);
  }
  
  function getSubscriptionReference(
    userId: string,
    subscriptionId: string
  ) {
    return getAdminFirestore()
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .doc(subscriptionId);
  }
  
  function getPdfExportCreditReference(
    userId: string,
    creditId: string
  ) {
    return getAdminFirestore()
      .collection("users")
      .doc(userId)
      .collection("pdf_export_credits")
      .doc(creditId);
  }
  
  export async function savePurchaseRecordServer(
    purchase: PurchaseRecord
  ): Promise<void> {
    await getPurchaseReference(
      purchase.userId,
      purchase.id
    ).set({
      ...purchase,
  
      createdAt: toFirestoreDate(
        purchase.createdAt
      ),
  
      updatedAt: toFirestoreDate(
        purchase.updatedAt
      ),
    });
  }
  
  export async function saveSubscriptionRecordServer(
    subscription: SubscriptionRecord
  ): Promise<void> {
    await getSubscriptionReference(
      subscription.userId,
      subscription.id
    ).set({
      ...subscription,
  
      currentPeriodStart:
        subscription.currentPeriodStart
          ? toFirestoreDate(
              subscription.currentPeriodStart
            )
          : null,
  
      currentPeriodEnd:
        subscription.currentPeriodEnd
          ? toFirestoreDate(
              subscription.currentPeriodEnd
            )
          : null,
  
      createdAt: toFirestoreDate(
        subscription.createdAt
      ),
  
      updatedAt: toFirestoreDate(
        subscription.updatedAt
      ),
    });
  }
  
  export async function savePdfExportCreditServer(
    credit: PdfExportCredit
  ): Promise<void> {
    await getPdfExportCreditReference(
      credit.userId,
      credit.id
    ).set({
      ...credit,
  
      consumedAt:
        credit.consumedAt
          ? toFirestoreDate(
              credit.consumedAt
            )
          : null,
  
      createdAt: toFirestoreDate(
        credit.createdAt
      ),
    });
  }
  
  export async function consumePdfExportCreditServer(
    userId: string,
    creditId: string
  ): Promise<boolean> {
    const reference =
      getPdfExportCreditReference(
        userId,
        creditId
      );
  
    return getAdminFirestore().runTransaction(
      async (
        transaction: Transaction
      ) => {
        const snapshot =
          await transaction.get(
            reference
          );
  
        if (!snapshot.exists) {
          return false;
        }
  
        const data =
          snapshot.data();
  
        if (
          !data ||
          data.consumed === true
        ) {
          return false;
        }
  
        transaction.update(
          reference,
          {
            consumed: true,
  
            consumedAt:
              FieldValue.serverTimestamp(),
          }
        );
  
        return true;
      }
    );
  }