import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ENTITLEMENTS,
} from "../../../../lib/entitlements";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../../../../lib/firebase-admin";

import {
  reconcileDostPremiumAccess,
} from "../../../../lib/subscription-lifecycle";

export const runtime = "nodejs";

function getBearerToken(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token =
    authorization
      .slice(7)
      .trim();

  return token || null;
}

function getSafeErrorName(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (
      error as {
        name?: unknown;
      }
    ).name === "string"
  ) {
    return (
      error as {
        name: string;
      }
    ).name;
  }

  return "UnknownError";
}

export async function GET(
  request: NextRequest
) {
  try {
    const idToken =
      getBearerToken(request);

    if (!idToken) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const decodedToken =
      await getAdminAuth()
        .verifyIdToken(
          idToken,
          true
        );

    const firestore =
      getAdminFirestore();

    /*
     * Reconcile any scheduled Premium
     * cancellation before reading access.
     *
     * This is intentionally awaited before
     * the entitlement read below. If the
     * already-paid period has ended,
     * reconcileDostPremiumAccess removes
     * Premium entitlements first so this
     * route cannot grant unlimited PDF
     * export from stale profile data.
     */
    await reconcileDostPremiumAccess(
      firestore,
      decodedToken.uid
    );

    const userReference =
      firestore
        .collection("users")
        .doc(decodedToken.uid);

    const [
      userSnapshot,
      creditsSnapshot,
    ] = await Promise.all([
      userReference.get(),

      userReference
        .collection(
          "pdf_export_credits"
        )
        .where(
          "consumed",
          "==",
          false
        )
        .get(),
    ]);

    const userData =
      userSnapshot.exists
        ? userSnapshot.data()
        : undefined;

    const entitlements =
      Array.isArray(
        userData?.entitlements
      )
        ? userData.entitlements.filter(
            (
              entitlement
            ): entitlement is string =>
              typeof entitlement ===
                "string"
          )
        : [];

    const hasUnlimitedPdfExport =
      entitlements.includes(
        ENTITLEMENTS.PDF_EXPORT
      );

    const availableCredits =
      creditsSnapshot.size;

    const canExport =
      hasUnlimitedPdfExport ||
      availableCredits > 0;

    const accessMode =
      hasUnlimitedPdfExport
        ? "premium"
        : availableCredits > 0
          ? "credit"
          : "none";

    return NextResponse.json(
      {
        canExport,

        accessMode,

        premium:
          hasUnlimitedPdfExport,

        availableCredits,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ACCOUNT PDF access error:",
      getSafeErrorName(error)
    );

    return NextResponse.json(
      {
        error:
          "PDF export access could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
