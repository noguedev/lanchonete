import { AppError } from "../../../models/exception-base.js";

export class AddressNotFoundException extends AppError {
  constructor() {
    super("Endereço não encontrado", 404);
  }
}
