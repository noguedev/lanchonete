import { ProductNotFoundException } from "../../product/exceptions/product-not-found.exception.js";
import type { ProductRepository } from "../../product/product.repository.js";
import { buildCartResponse } from "../cart.mapper.js";
import type { UpdateCartItemDTO } from "../cart.dtos.js";
import type { CartRepository } from "../cart.repository.js";
import { CartItemNotFoundException } from "../exceptions/cart-item-not-found.exception.js";
import { ProductUnavailableException } from "../exceptions/product-unavailable.exception.js";

export class UpdateCartItemService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(userId: string, productId: string, data: UpdateCartItemDTO) {
    const cart = await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      throw new CartItemNotFoundException();
    }

    const item = await this.cartRepository.findItem(cart.id, productId);

    if (!item) {
      throw new CartItemNotFoundException();
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException();
    }

    if (!product.isActive) {
      throw new ProductUnavailableException();
    }

    await this.cartRepository.updateItemQuantity(
      item.id,
      data.quantity,
      product.price,
    );

    await this.cartRepository.touchCart(cart.id);

    const rows = await this.cartRepository.getItemsWithProduct(cart.id);

    return buildCartResponse(rows);
  }
}
