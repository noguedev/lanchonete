import { AppError } from "../../../models/exception-base.js";

export class ProductNotFoundException extends AppError {
  constructor() {
    super("Produto não encontrado", 404);
  }
}
