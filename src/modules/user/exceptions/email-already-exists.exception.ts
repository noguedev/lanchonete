import { AppError } from "../../../models/exception-base.js";

export class EmailAlreadyExistsException extends AppError {
  constructor() {
    super("Já existe um usuário com este email", 409);
  }
}
