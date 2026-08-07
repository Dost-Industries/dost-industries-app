import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");

    this.name = "ValidationError";

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}