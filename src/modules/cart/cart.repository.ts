import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { cartItemTable, cartTable, productTable } from "../../db/schema.js";
import type { Cart, CartItem, CartItemInsert } from "../../models/index.js";
import type { CartItemRow } from "./cart.mapper.js";

export class CartRepository {
  async findCartByUserId(userId: string): Promise<Cart | undefined> {
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.userId, userId))
      .limit(1);

    return cart;
  }

  async createCart(userId: string): Promise<Cart> {
    const [cart] = await db.insert(cartTable).values({ userId }).returning();

    return cart!;
  }

  async findOrCreateCart(userId: string): Promise<Cart> {
    const existing = await this.findCartByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.createCart(userId);
  }

  async addItem(data: CartItemInsert): Promise<CartItem> {
    const [item] = await db.insert(cartItemTable).values(data).returning();

    return item!;
  }

  async findItem(
    cartId: string,
    productId: string,
  ): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItemTable)
      .where(
        and(
          eq(cartItemTable.cartId, cartId),
          eq(cartItemTable.productId, productId),
        ),
      )
      .limit(1);

    return item;
  }

  async updateItemQuantity(
    itemId: string,
    quantity: number,
    unitPrice: string,
  ): Promise<CartItem> {
    const [item] = await db
      .update(cartItemTable)
      .set({ quantity, unitPrice, updatedAt: new Date() })
      .where(eq(cartItemTable.id, itemId))
      .returning();

    return item!;
  }

  async removeItem(cartId: string, productId: string): Promise<void> {
    await db
      .delete(cartItemTable)
      .where(
        and(
          eq(cartItemTable.cartId, cartId),
          eq(cartItemTable.productId, productId),
        ),
      );
  }

  async getItemsWithProduct(cartId: string): Promise<CartItemRow[]> {
    return db
      .select({
        item: cartItemTable,
        product: productTable,
      })
      .from(cartItemTable)
      .innerJoin(productTable, eq(cartItemTable.productId, productTable.id))
      .where(eq(cartItemTable.cartId, cartId));
  }

  async touchCart(cartId: string): Promise<void> {
    await db
      .update(cartTable)
      .set({ updatedAt: new Date() })
      .where(eq(cartTable.id, cartId));
  }
}
