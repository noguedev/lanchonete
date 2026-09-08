import { AppError } from "../../../models/exception-base.js";

export class CartItemNotFoundException extends AppError {
  constructor() {
    super("Item do carrinho não encontrado.", 404);
  }
}
