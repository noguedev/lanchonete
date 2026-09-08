import { describe, it, expect } from "vitest";

import { buildCartResponse } from "./cart.mapper.js";
import type { CartItemRow } from "./cart.mapper.js";
import type { Product } from "../../models/index.js";

const product = (price: string): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Hambúrguer",
  slug: "hamburguer",
  description: null,
  price,
  imageUrl: "/uploads/products/x.png",
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

const row = (unitPrice: string, quantity: number, price: string): CartItemRow => ({
  item: {
    id: "ci1",
    cartId: "cart1",
    productId: "prod1",
    quantity,
    unitPrice,
    createdAt: new Date(),
    updatedAt: null,
  },
  product: product(price),
});

describe("buildCartResponse", () => {
  it("builds a cart response with snapshot and current price", () => {
    const result = buildCartResponse([row("10.00", 2, "10.00")]);

    expect(result.items[0]).toMatchObject({
      quantity: 2,
      unitPrice: 10,
      currentPrice: 10,
      priceChanged: false,
      subtotal: 20,
    });
    expect(result.total).toBe(20);
    expect(result.itemCount).toBe(2);
  });

  it("flags priceChanged when the product price differs from the snapshot", () => {
    const result = buildCartResponse([row("10.00", 2, "12.50")]);

    expect(result.items[0]!.priceChanged).toBe(true);
    expect(result.items[0]!.subtotal).toBe(25);
    expect(result.total).toBe(25);
  });

  it("sums multiple items and quantities", () => {
    const result = buildCartResponse([
      row("5.00", 1, "5.00"),
      row("7.00", 3, "7.00"),
    ]);

    expect(result.itemCount).toBe(4);
    expect(result.total).toBe(26);
  });
});
