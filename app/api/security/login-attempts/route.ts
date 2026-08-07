import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth } from "../../../../lib/firebase-admin";

import {
  checkRateLimit,
  clearFailedAttempts,
  registerFailedAttempt,
} from "../../../../lib/security/rateLimiter";

type RateLimitAction =
  | "check"
  | "failure"
  | "success";

type RequestBody = {
  action?: RateLimitAction;
  identifier?: string;
};

function getClientIp(request: NextRequest): string {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp =
    request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createIdentifier(
  email: string,
  ipAddress: string
): string {
  return createHash("sha256")
    .update(`${ipAddress}:${normalizeEmail(email)}`)
    .digest("hex");
}

async function verifySuccessfulLogin(
  request: NextRequest,
  requestedEmail: string
): Promise<boolean> {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const idToken = authorization.slice(7).trim();

  if (!idToken) {
    return false;
  }

  const decodedToken =
    await getAdminAuth().verifyIdToken(idToken);

  const authenticatedEmail =
    decodedToken.email?.trim().toLowerCase();

  return (
    typeof authenticatedEmail === "string" &&
    authenticatedEmail === normalizeEmail(requestedEmail)
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    const action = body.action;
    const rawIdentifier = body.identifier;

    if (
      !action ||
      !rawIdentifier ||
      !["check", "failure", "success"].includes(
        action
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid request.",
        },
        {
          status: 400,
        }
      );
    }

    const email = normalizeEmail(rawIdentifier);

    if (!email) {
      return NextResponse.json(
        {
          error: "Invalid request.",
        },
        {
          status: 400,
        }
      );
    }

    const identifier = createIdentifier(
      email,
      getClientIp(request)
    );

    if (action === "check") {
      const result =
        await checkRateLimit(identifier);

      return NextResponse.json(result);
    }

    if (action === "failure") {
      const result =
        await registerFailedAttempt(identifier);

      return NextResponse.json(result);
    }

    const authenticated =
      await verifySuccessfulLogin(
        request,
        email
      );

    if (!authenticated) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await clearFailedAttempts(identifier);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "SEC-016 login rate limit error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process login security request.",
      },
      {
        status: 500,
      }
    );
  }
}