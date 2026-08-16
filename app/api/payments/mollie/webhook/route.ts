import { NextResponse } from "next/server";

import {
  getMollieClient,
} from "../../../../../lib/payments/mollieClient";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const paymentId =
      formData.get("id");

    if (
      typeof paymentId !== "string" ||
      !paymentId.startsWith("tr_")
    ) {
      return NextResponse.json(
        {
          error:
            "INVALID_MOLLIE_PAYMENT_ID",
        },
        {
          status: 400,
        }
      );
    }

    const mollie =
      getMollieClient();

    await mollie.payments.get(
      paymentId
    );

    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Mollie webhook error:",
      error instanceof Error
        ? error.name
        : "UnknownError"
    );

    return NextResponse.json(
      {
        error:
          "MOLLIE_WEBHOOK_PROCESSING_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}