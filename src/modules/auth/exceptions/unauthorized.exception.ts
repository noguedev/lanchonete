import { AppError } from "../../../models/exception-base.js";

export class UnauthorizedException extends AppError {
  constructor() {
    super("Não autenticado", 401);
  }
}
