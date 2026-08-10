import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../../../../lib/firebase-admin";

import {
  isPurchaseProvider,
} from "../../../../lib/purchase-validation";

import {
  syncSubscriptionAccess,
} from "../../../../lib/subscription-access";

import {
  validatePurchase,
} from "../../../../lib/validate-purchase";

type RestoreRequestBody = {
  provider?: string;
  purchaseId?: string;
};

async function getAuthenticatedUid(
  request: NextRequest
): Promise<string | null> {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization?.startsWith("Bearer ")
  ) {
    return null;
  }

  const idToken =
    authorization.slice(7).trim();

  if (!idToken) {
    return null;
  }

  const decodedToken =
    await getAdminAuth().verifyIdToken(
      idToken
    );

  return decodedToken.uid;
}

export async function POST(
  request: NextRequest
) {
  try {
    const uid =
      await getAuthenticatedUid(
        request
      );

    if (!uid) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as RestoreRequestBody;

    const provider =
      body.provider?.trim();

    const purchaseId =
      body.purchaseId?.trim();

    if (
      !provider ||
      !purchaseId
    ) {
      return NextResponse.json(
        {
          error:
            "Purchase information is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isPurchaseProvider(provider)
    ) {
      return NextResponse.json(
        {
          restored: false,
          subscription: null,
          message:
            "Purchase provider is not supported.",
        },
        {
          status: 400,
        }
      );
    }

    const validation =
      await validatePurchase({
        provider,
        purchaseId,
      });

    if (!validation.valid) {
      return NextResponse.json({
        restored: false,
        subscription: null,
        message:
          "No validated purchase was found.",
      });
    }

    await syncSubscriptionAccess(
      getAdminFirestore(),
      uid,
      validation.purchase.subscription
    );

    return NextResponse.json({
      restored: true,
      subscription:
        validation.purchase.subscription,
      message:
        "DOST Premium purchase restored.",
    });
  } catch (error) {
    console.error(
      "MON-007 purchase validation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to validate purchase.",
      },
      {
        status: 500,
      }
    );
  }
}