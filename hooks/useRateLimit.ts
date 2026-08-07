"use client";

import { useEffect, useState } from "react";

interface UseRateLimitOptions {
  maxAttempts?: number;
  lockoutSeconds?: number;
}

export function useRateLimit({
  maxAttempts = 5,
  lockoutSeconds = 30,
}: UseRateLimitOptions = {}) {
  const [attempts, setAttempts] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isLocked = remainingSeconds > 0;

  useEffect(() => {
    if (!isLocked) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setAttempts(0);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked]);

  function registerFailure() {
    setAttempts((previous) => {
      const next = previous + 1;

      if (next >= maxAttempts) {
        setRemainingSeconds(lockoutSeconds);
      }

      return next;
    });
  }

  function reset() {
    setAttempts(0);
    setRemainingSeconds(0);
  }

  const message = isLocked
    ? `Too many login attempts. Try again in ${remainingSeconds} seconds.`
    : "";

  return {
    attempts,
    isLocked,
    remainingSeconds,
    message,
    registerFailure,
    reset,
  };
}