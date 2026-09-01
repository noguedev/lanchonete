import { AppError } from "../../../models/exception-base.js";

export class ForbiddenException extends AppError {
  constructor() {
    super("Sem permissão para executar essa ação", 403);
  }
}
