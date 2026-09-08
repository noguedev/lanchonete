import { describe, it, expect, vi, beforeEach } from "vitest";

import { RemoveCartItemService } from "./remove-cart-item.service.js";
import { CartItemNotFoundException } from "../exceptions/cart-item-not-found.exception.js";
import type { CartRepository } from "../cart.repository.js";
import type { Cart, Product } from "../../../models/index.js";

const fakeCart = (): Cart => ({
  id: "cart1",
  userId: "u1",
  createdAt: new Date(),
  updatedAt: null,
});

const fakeProduct = (): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Hambúrguer",
  slug: "hamburguer",
  description: null,
  price: "10.00",
  imageUrl: null,
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

describe("RemoveCartItemService", () => {
  let findCartByUserId: ReturnType<typeof vi.fn>;
  let findItem: ReturnType<typeof vi.fn>;
  let removeItem: ReturnType<typeof vi.fn>;
  let getItemsWithProduct: ReturnType<typeof vi.fn>;
  let service: RemoveCartItemService;

  beforeEach(() => {
    findCartByUserId = vi.fn();
    findItem = vi.fn();
    removeItem = vi.fn();
    getItemsWithProduct = vi.fn();

    const repo = {
      findCartByUserId,
      findItem,
      removeItem,
      getItemsWithProduct,
      touchCart: vi.fn(),
      findOrCreateCart: vi.fn(),
      addItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      createCart: vi.fn(),
    } as unknown as CartRepository;

    service = new RemoveCartItemService(repo);
  });

  it("throws CartItemNotFoundException when there is no cart", async () => {
    findCartByUserId.mockResolvedValue(undefined);

    await expect(service.execute("u1", "prod1")).rejects.toBeInstanceOf(
      CartItemNotFoundException,
    );
  });

  it("throws CartItemNotFoundException when the item is not in the cart", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(undefined);

    await expect(service.execute("u1", "prod1")).rejects.toBeInstanceOf(
      CartItemNotFoundException,
    );
  });

  it("removes the item and returns the remaining cart", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue({
      id: "ci1",
      cartId: "cart1",
      productId: "prod1",
      quantity: 1,
      unitPrice: "10.00",
      createdAt: new Date(),
      updatedAt: null,
    });
    removeItem.mockResolvedValue(undefined);
    getItemsWithProduct.mockResolvedValue([]);

    const result = await service.execute("u1", "prod1");

    expect(removeItem).toHaveBeenCalledWith("cart1", "prod1");
    expect(result).toEqual({ items: [], total: 0, itemCount: 0 });
  });
});
