import "server-only";

import {
  deleteLoginAttempt,
  getLoginAttempt,
  saveLoginAttempt,
} from "./loginAttempts";

import type {
  LoginAttempt,
  RateLimitResult,
} from "./types";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 1000;

function calculateRetryAfter(
  blockedUntil: number,
  now: number
): number {
  return Math.max(
    1,
    Math.ceil((blockedUntil - now) / 1000)
  );
}

function allowedResult(
  remainingAttempts: number
): RateLimitResult {
  return {
    allowed: true,
    remainingAttempts: Math.max(0, remainingAttempts),
    retryAfterSeconds: 0,
  };
}

function blockedResult(
  blockedUntil: number,
  now: number
): RateLimitResult {
  return {
    allowed: false,
    remainingAttempts: 0,
    retryAfterSeconds: calculateRetryAfter(
      blockedUntil,
      now
    ),
  };
}

export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();

  const existing = await getLoginAttempt(identifier);

  if (!existing) {
    return allowedResult(MAX_ATTEMPTS);
  }

  if (
    existing.blockedUntil !== null &&
    existing.blockedUntil > now
  ) {
    return blockedResult(
      existing.blockedUntil,
      now
    );
  }

  const windowExpired =
    now - existing.firstAttemptAt >= WINDOW_MS;

  const lockoutExpired =
    existing.blockedUntil !== null &&
    existing.blockedUntil <= now;

  if (windowExpired || lockoutExpired) {
    await deleteLoginAttempt(identifier);

    return allowedResult(MAX_ATTEMPTS);
  }

  return allowedResult(
    MAX_ATTEMPTS - existing.attempts
  );
}

export async function registerFailedAttempt(
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();

  const existing = await getLoginAttempt(identifier);

  if (!existing) {
    const newAttempt: LoginAttempt = {
      identifier,
      attempts: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      blockedUntil: null,
    };

    await saveLoginAttempt(newAttempt);

    return allowedResult(MAX_ATTEMPTS - 1);
  }

  if (
    existing.blockedUntil !== null &&
    existing.blockedUntil > now
  ) {
    return blockedResult(
      existing.blockedUntil,
      now
    );
  }

  const windowExpired =
    now - existing.firstAttemptAt >= WINDOW_MS;

  const lockoutExpired =
    existing.blockedUntil !== null &&
    existing.blockedUntil <= now;

  if (windowExpired || lockoutExpired) {
    const resetAttempt: LoginAttempt = {
      identifier,
      attempts: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      blockedUntil: null,
    };

    await saveLoginAttempt(resetAttempt);

    return allowedResult(MAX_ATTEMPTS - 1);
  }

  const attempts = existing.attempts + 1;

  if (attempts >= MAX_ATTEMPTS) {
    const blockedUntil = now + LOCKOUT_MS;

    const blockedAttempt: LoginAttempt = {
      identifier,
      attempts,
      firstAttemptAt: existing.firstAttemptAt,
      lastAttemptAt: now,
      blockedUntil,
    };

    await saveLoginAttempt(blockedAttempt);

    return blockedResult(blockedUntil, now);
  }

  const updatedAttempt: LoginAttempt = {
    identifier,
    attempts,
    firstAttemptAt: existing.firstAttemptAt,
    lastAttemptAt: now,
    blockedUntil: null,
  };

  await saveLoginAttempt(updatedAttempt);

  return allowedResult(
    MAX_ATTEMPTS - attempts
  );
}

export async function clearFailedAttempts(
  identifier: string
): Promise<RateLimitResult> {
  await deleteLoginAttempt(identifier);

  return allowedResult(MAX_ATTEMPTS);
}