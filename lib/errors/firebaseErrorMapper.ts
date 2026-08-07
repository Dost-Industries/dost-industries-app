import { ERROR_MESSAGES } from "./errorMessages";

type FirebaseLikeError = Error & {
  code?: string;
};

export function mapFirebaseError(error: unknown): string {
  if (!(error instanceof Error)) {
    return ERROR_MESSAGES.UNKNOWN;
  }

  const firebaseError = error as FirebaseLikeError;

  switch (firebaseError.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return ERROR_MESSAGES.LOGIN;

    case "auth/invalid-email":
      return ERROR_MESSAGES.VALIDATION;

    case "auth/email-already-in-use":
      return "An account with this email address already exists.";

    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";

    case "permission-denied":
      return ERROR_MESSAGES.PERMISSION;

    default: {
      const message = firebaseError.message.toLowerCase();

      if (message.includes("network")) {
        return ERROR_MESSAGES.NETWORK;
      }

      return ERROR_MESSAGES.FIREBASE;
    }
  }
}