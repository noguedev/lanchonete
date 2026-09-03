import { AppError } from "../../../models/exception-base.js";

export class ProductImageRequiredException extends AppError {
  constructor() {
    super("Imagem do produto é obrigatória.", 400);
  }
}
