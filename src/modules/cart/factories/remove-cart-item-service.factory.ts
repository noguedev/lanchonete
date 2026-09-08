import { CartRepository } from "../cart.repository.js";
import { RemoveCartItemService } from "../services/remove-cart-item.service.js";

export function makeRemoveCartItemService() {
  const cartRepository = new CartRepository();

  return new RemoveCartItemService(cartRepository);
}
