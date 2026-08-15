import type {
    PdfExportCredit,
  } from "./types";
  
  export function createPdfExportCredit(
    id: string,
    userId: string,
    sourcePurchaseId: string,
    createdAt: Date = new Date()
  ): PdfExportCredit {
    return {
      id,
      userId,
      sourcePurchaseId,
      consumed: false,
      consumedAt: null,
      createdAt,
    };
  }
  
  export function canConsumePdfExportCredit(
    credit: PdfExportCredit
  ): boolean {
    return !credit.consumed;
  }
  
  export function consumePdfExportCredit(
    credit: PdfExportCredit,
    consumedAt: Date = new Date()
  ): PdfExportCredit {
    if (credit.consumed) {
      throw new Error(
        "PDF_EXPORT_CREDIT_ALREADY_CONSUMED"
      );
    }
  
    return {
      ...credit,
      consumed: true,
      consumedAt,
    };
  }