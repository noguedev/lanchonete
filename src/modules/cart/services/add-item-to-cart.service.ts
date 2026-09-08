import { ProductNotFoundException } from "../../product/exceptions/product-not-found.exception.js";
import type { ProductRepository } from "../../product/product.repository.js";
import type { AddCartItemDTO } from "../cart.dtos.js";
import type { CartRepository } from "../cart.repository.js";
import { ProductUnavailableException } from "../exceptions/product-unavailable.exception.js";

export class AddItemToCartService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(userId: string, data: AddCartItemDTO) {
    const product = await this.productRepository.findById(data.productId);

    if (!product) {
      throw new ProductNotFoundException();
    }

    if (!product.isActive || !product.isAvailable) {
      throw new ProductUnavailableException();
    }

    const cart = await this.cartRepository.findOrCreateCart(userId);

    const existing = await this.cartRepository.findItem(cart.id, data.productId);

    if (existing) {
      await this.cartRepository.updateItemQuantity(
        existing.id,
        existing.quantity + data.quantity,
        product.price,
      );
    } else {
      await this.cartRepository.addItem({
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: product.price,
      });
    }

    await this.cartRepository.touchCart(cart.id);
  }
}
