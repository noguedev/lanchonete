import { AppError } from "../../../models/exception-base.js";

export class CategoryNotFoundException extends AppError {
  constructor() {
    super("Categoria não encontrada", 404);
  }
}
