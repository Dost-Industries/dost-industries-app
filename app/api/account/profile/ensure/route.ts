import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminAuth,
  getAdminFirestore,
} from "../../../../../lib/firebase-admin";

import {
  reconcileDostPremiumAccess,
} from "../../../../../lib/subscription-lifecycle";

import {
  ensureUserProfileServer,
} from "../../../../../lib/users/ensureUserProfile";

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

export async function POST(
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

    if (!decodedToken.uid) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Ensure the parent profile exists before
     * subscription lifecycle reconciliation.
     *
     * This keeps the existing self-healing
     * profile behavior intact while allowing
     * a scheduled Premium cancellation to be
     * finalized before the client loads the
     * user's current entitlements.
     */
    const result =
      await ensureUserProfileServer(
        decodedToken.uid
      );

    const firestore =
      getAdminFirestore();

    const reconciliation =
      await reconcileDostPremiumAccess(
        firestore,
        decodedToken.uid
      );

    /*
     * The client does not need billing/provider
     * details. It only needs to know when a
     * currently retained canceled Premium period
     * ends so it can refresh its UI state then.
     *
     * ACCESS_PERIOD_ACTIVE is only returned for
     * the deliberate cancel-at-period-end flow.
     * Normal recurring subscriptions therefore
     * do not receive an expiry timer from this
     * endpoint.
     */
    const premiumExpiryAt =
      reconciliation.reason ===
        "ACCESS_PERIOD_ACTIVE" &&
      reconciliation.accessUntil
        ? reconciliation.accessUntil
            .toISOString()
        : null;

    return NextResponse.json({
      success: true,

      created:
        result.created,

      repaired:
        result.repaired,

      premiumExpiryAt,
    });
  } catch (error) {
    console.error(
      "ACCOUNT profile ensure error:",
      getSafeErrorName(error)
    );

    return NextResponse.json(
      {
        error:
          "The user profile could not be initialized.",
      },
      {
        status: 500,
      }
    );
  }
}
