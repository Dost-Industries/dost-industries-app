import { AppError } from "./AppError";

export class FirebaseAppError extends AppError {
  constructor(message: string, code = "FIREBASE_ERROR") {
    super(message, code);

    this.name = "FirebaseAppError";

    Object.setPrototypeOf(this, FirebaseAppError.prototype);
  }
}