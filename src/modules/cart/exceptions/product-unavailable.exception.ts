import { AppError } from "../../../models/exception-base.js";

export class ProductUnavailableException extends AppError {
  constructor() {
    super("Produto indisponível no momento.", 400);
  }
}
