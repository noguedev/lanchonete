import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetCartService } from "./get-cart.service.js";
import type { CartRepository } from "../cart.repository.js";
import type { Cart, Product } from "../../../models/index.js";

const fakeCart = (): Cart => ({
  id: "cart1",
  userId: "u1",
  createdAt: new Date(),
  updatedAt: null,
});

const product = (price: string): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Hambúrguer",
  slug: "hamburguer",
  description: null,
  price,
  imageUrl: null,
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

describe("GetCartService", () => {
  let findCartByUserId: ReturnType<typeof vi.fn>;
  let getItemsWithProduct: ReturnType<typeof vi.fn>;
  let service: GetCartService;

  beforeEach(() => {
    findCartByUserId = vi.fn();
    getItemsWithProduct = vi.fn();

    const repo = {
      findCartByUserId,
      getItemsWithProduct,
      findOrCreateCart: vi.fn(),
      addItem: vi.fn(),
      findItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      touchCart: vi.fn(),
      createCart: vi.fn(),
    } as unknown as CartRepository;

    service = new GetCartService(repo);
  });

  it("returns an empty cart when the user has no cart", async () => {
    findCartByUserId.mockResolvedValue(undefined);

    const result = await service.execute("u1");

    expect(result).toEqual({ items: [], total: 0, itemCount: 0 });
  });

  it("returns the cart with price comparison when the user has items", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    getItemsWithProduct.mockResolvedValue([
      {
        item: {
          id: "ci1",
          cartId: "cart1",
          productId: "prod1",
          quantity: 2,
          unitPrice: "10.00",
          createdAt: new Date(),
          updatedAt: null,
        },
        product: product("12.00"),
      },
    ]);

    const result = await service.execute("u1");

    expect(result.items[0]).toMatchObject({
      quantity: 2,
      unitPrice: 10,
      currentPrice: 12,
      priceChanged: true,
      subtotal: 24,
    });
    expect(result.total).toBe(24);
    expect(result.itemCount).toBe(2);
  });
});
