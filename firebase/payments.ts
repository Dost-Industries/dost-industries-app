import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
  } from "firebase/firestore";
  
  import { db } from "./config";
  
  import type {
    PdfExportCredit,
    PurchaseRecord,
    SubscriptionRecord,
  } from "../lib/payments";
  
  function getPurchasesCollection(
    userId: string
  ) {
    return collection(
      db,
      "users",
      userId,
      "purchases"
    );
  }
  
  function getSubscriptionsCollection(
    userId: string
  ) {
    return collection(
      db,
      "users",
      userId,
      "subscriptions"
    );
  }
  
  function getPdfExportCreditsCollection(
    userId: string
  ) {
    return collection(
      db,
      "users",
      userId,
      "pdf_export_credits"
    );
  }
  
  export async function getPurchaseRecord(
    userId: string,
    purchaseId: string
  ): Promise<PurchaseRecord | null> {
    const reference = doc(
      getPurchasesCollection(userId),
      purchaseId
    );
  
    const snapshot =
      await getDoc(reference);
  
    if (!snapshot.exists()) {
      return null;
    }
  
    return snapshot.data() as PurchaseRecord;
  }
  
  export async function getPurchaseByProviderId(
    userId: string,
    providerPurchaseId: string
  ): Promise<PurchaseRecord | null> {
    const purchasesQuery = query(
      getPurchasesCollection(userId),
      where(
        "providerPurchaseId",
        "==",
        providerPurchaseId
      )
    );
  
    const snapshot =
      await getDocs(purchasesQuery);
  
    if (snapshot.empty) {
      return null;
    }
  
    return snapshot.docs[0]
      .data() as PurchaseRecord;
  }
  
  export async function getSubscriptionRecord(
    userId: string,
    subscriptionId: string
  ): Promise<SubscriptionRecord | null> {
    const reference = doc(
      getSubscriptionsCollection(userId),
      subscriptionId
    );
  
    const snapshot =
      await getDoc(reference);
  
    if (!snapshot.exists()) {
      return null;
    }
  
    return snapshot.data() as SubscriptionRecord;
  }
  
  export async function getAvailablePdfExportCredits(
    userId: string
  ): Promise<PdfExportCredit[]> {
    const creditsQuery = query(
      getPdfExportCreditsCollection(userId),
      where(
        "consumed",
        "==",
        false
      )
    );
  
    const snapshot =
      await getDocs(creditsQuery);
  
    return snapshot.docs.map(
      (document) =>
        document.data() as PdfExportCredit
    );
  }