import { ProductNotFoundException } from "../exceptions/product-not-found.exception.js";
import type { ProductRepository } from "../product.repository.js";

export class DeactivateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundException();
    }

    return this.productRepository.setActive(id, false);
  }
}
