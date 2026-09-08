import { ProductRepository } from "../../product/product.repository.js";
import { CartRepository } from "../cart.repository.js";
import { UpdateCartItemService } from "../services/update-cart-item.service.js";

export function makeUpdateCartItemService() {
  const productRepository = new ProductRepository();
  const cartRepository = new CartRepository();

  return new UpdateCartItemService(productRepository, cartRepository);
}
