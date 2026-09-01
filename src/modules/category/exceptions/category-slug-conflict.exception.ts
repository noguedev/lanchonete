import { AppError } from "../../../models/exception-base.js";

export class CategorySlugConflictException extends AppError {
  constructor() {
    super("Já existe uma categoria com esse nome", 409);
  }
}
