export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorMessages: string[];

  constructor(message: string, statusCode: number = 400, errorMessages: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorMessages = errorMessages.length > 0 ? errorMessages : [message];
  }
}