import { AppError } from "../../../models/exception-base.js";

export class InvalidImageException extends AppError {
  constructor() {
    super("Imagem inválida. Envie um arquivo JPEG ou PNG.", 400);
  }
}
