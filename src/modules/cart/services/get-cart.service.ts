import { buildCartResponse } from "../cart.mapper.js";
import type { CartRepository } from "../cart.repository.js";

export class GetCartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string) {
    const cart = await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const rows = await this.cartRepository.getItemsWithProduct(cart.id);

    return buildCartResponse(rows);
  }
}
