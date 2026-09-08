import { AppError } from "../../../models/exception-base.js";

export class AccountDisabledException extends AppError {
  constructor() {
    super("Conta desativada ou banida.", 403);
  }
}
