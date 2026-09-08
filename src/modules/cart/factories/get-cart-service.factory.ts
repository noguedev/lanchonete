import { CartRepository } from "../cart.repository.js";
import { GetCartService } from "../services/get-cart.service.js";

export function makeGetCartService() {
  const cartRepository = new CartRepository();

  return new GetCartService(cartRepository);
}
