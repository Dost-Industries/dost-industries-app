import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
  } from "firebase/firestore";
  
  import { db } from "./config";
  
  export type CalculationRecord<
    TInputs extends Record<string, unknown> =
      Record<string, unknown>,
    TResult extends Record<string, unknown> =
      Record<string, unknown>
  > = {
    id: string;
    moduleId: string;
    inputs: TInputs;
    result: TResult;
    createdAt: unknown;
    updatedAt: unknown;
  };
  
  export async function saveCalculation<
    TInputs extends Record<string, unknown>,
    TResult extends Record<string, unknown>
  >(
    uid: string,
    moduleId: string,
    inputs: TInputs,
    result: TResult
  ): Promise<string> {
    const calculationRef = doc(
      collection(
        db,
        "users",
        uid,
        "calculations"
      )
    );
  
    await setDoc(calculationRef, {
      moduleId,
      inputs,
      result,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  
    return calculationRef.id;
  }
  
  export async function getCalculations(
    uid: string
  ): Promise<CalculationRecord[]> {
    const calculationsQuery = query(
      collection(
        db,
        "users",
        uid,
        "calculations"
      ),
      orderBy("createdAt", "desc")
    );
  
    const snapshot =
      await getDocs(calculationsQuery);
  
    return snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    })) as CalculationRecord[];
  }
  
  export async function deleteCalculation(
    uid: string,
    calculationId: string
  ): Promise<void> {
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "calculations",
        calculationId
      )
    );
  }