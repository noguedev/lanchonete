import { AppError } from "../../../models/exception-base.js";

export class EmailOrPasswordException extends AppError {
  constructor() {
    super("Email ou senha inválido", 401);
  }
}
