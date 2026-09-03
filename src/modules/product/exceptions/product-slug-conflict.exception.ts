import { AppError } from "../../../models/exception-base.js";

export class ProductSlugConflictException extends AppError {
  constructor() {
    super("Já existe um produto com esse nome", 409);
  }
}
