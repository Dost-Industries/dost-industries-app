export class AppError extends Error {
    public readonly code: string;
  
    constructor(message: string, code = "UNKNOWN_ERROR") {
      super(message);
  
      this.name = "AppError";
      this.code = code;
  
      Object.setPrototypeOf(this, AppError.prototype);
    }
  }