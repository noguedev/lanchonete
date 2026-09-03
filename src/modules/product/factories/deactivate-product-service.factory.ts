import { ProductRepository } from "../product.repository.js";
import { DeactivateProductService } from "../services/deactivate-product.service.js";

export function makeDeactivateProductService() {
  const productRepository = new ProductRepository();

  return new DeactivateProductService(productRepository);
}
