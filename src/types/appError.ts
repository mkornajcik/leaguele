export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true, status = "error") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
