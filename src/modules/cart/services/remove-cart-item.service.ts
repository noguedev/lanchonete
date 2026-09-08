import { buildCartResponse } from "../cart.mapper.js";
import type { CartRepository } from "../cart.repository.js";
import { CartItemNotFoundException } from "../exceptions/cart-item-not-found.exception.js";

export class RemoveCartItemService {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string, productId: string) {
    const cart = await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      throw new CartItemNotFoundException();
    }

    const item = await this.cartRepository.findItem(cart.id, productId);

    if (!item) {
      throw new CartItemNotFoundException();
    }

    await this.cartRepository.removeItem(cart.id, productId);
    await this.cartRepository.touchCart(cart.id);

    const rows = await this.cartRepository.getItemsWithProduct(cart.id);

    return buildCartResponse(rows);
  }
}
