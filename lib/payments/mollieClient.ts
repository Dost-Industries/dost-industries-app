import "server-only";

import createMollieClient from "@mollie/api-client";

function getMollieApiKey(): string {
  const apiKey =
    process.env.MOLLIE_TEST_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MOLLIE_TEST_API_KEY_MISSING"
    );
  }

  return apiKey;
}

export function getMollieClient() {
  return createMollieClient({
    apiKey:
      getMollieApiKey(),
  });
}