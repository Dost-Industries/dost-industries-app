export interface LoginAttempt {
    identifier: string;
    attempts: number;
    firstAttemptAt: number;
    lastAttemptAt: number;
    blockedUntil: number | null;
  }
  
  export interface RateLimitResult {
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  }