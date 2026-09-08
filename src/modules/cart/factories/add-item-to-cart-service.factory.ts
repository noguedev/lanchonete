import { ProductRepository } from "../../product/product.repository.js";
import { CartRepository } from "../cart.repository.js";
import { AddItemToCartService } from "../services/add-item-to-cart.service.js";

export function makeAddItemToCartService() {
  const productRepository = new ProductRepository();
  const cartRepository = new CartRepository();

  return new AddItemToCartService(productRepository, cartRepository);
}
