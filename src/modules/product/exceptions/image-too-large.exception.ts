import { AppError } from "../../../models/exception-base.js";

export class ImageTooLargeException extends AppError {
  constructor() {
    super("Imagem deve ter no máximo 1MB.", 400);
  }
}
