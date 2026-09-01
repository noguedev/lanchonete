import { AppError } from "../../../models/exception-base.js";

export class InvalidRefreshTokenException extends AppError {
  constructor() {
    super("Refresh token inválido ou expirado", 401);
  }
}
