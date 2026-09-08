import { describe, it, expect, vi, beforeEach } from "vitest";

import { UpdateCartItemService } from "./update-cart-item.service.js";
import { CartItemNotFoundException } from "../exceptions/cart-item-not-found.exception.js";
import { ProductUnavailableException } from "../exceptions/product-unavailable.exception.js";
import { ProductNotFoundException } from "../../product/exceptions/product-not-found.exception.js";
import type { ProductRepository } from "../../product/product.repository.js";
import type { CartRepository } from "../cart.repository.js";
import type { Cart, CartItem, Product } from "../../../models/index.js";

const fakeCart = (): Cart => ({
  id: "cart1",
  userId: "u1",
  createdAt: new Date(),
  updatedAt: null,
});

const fakeItem = (): CartItem => ({
  id: "ci1",
  cartId: "cart1",
  productId: "prod1",
  quantity: 1,
  unitPrice: "10.00",
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

describe("UpdateCartItemService", () => {
  let productRepo: ProductRepository;
  let cartRepo: CartRepository;
  let findCartByUserId: ReturnType<typeof vi.fn>;
  let findItem: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;
  let updateItemQuantity: ReturnType<typeof vi.fn>;
  let getItemsWithProduct: ReturnType<typeof vi.fn>;
  let service: UpdateCartItemService;

  beforeEach(() => {
    findCartByUserId = vi.fn();
    findItem = vi.fn();
    findById = vi.fn();
    updateItemQuantity = vi.fn();
    getItemsWithProduct = vi.fn();

    productRepo = { findById } as unknown as ProductRepository;

    cartRepo = {
      findCartByUserId,
      findItem,
      updateItemQuantity,
      getItemsWithProduct,
      touchCart: vi.fn(),
      findOrCreateCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      createCart: vi.fn(),
    } as unknown as CartRepository;

    service = new UpdateCartItemService(productRepo, cartRepo);
  });

  it("throws CartItemNotFoundException when there is no cart", async () => {
    findCartByUserId.mockResolvedValue(undefined);

    await expect(
      service.execute("u1", "prod1", { quantity: 2 }),
    ).rejects.toBeInstanceOf(CartItemNotFoundException);
  });

  it("throws CartItemNotFoundException when the item is not in the cart", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(undefined);

    await expect(
      service.execute("u1", "prod1", { quantity: 2 }),
    ).rejects.toBeInstanceOf(CartItemNotFoundException);
  });

  it("throws ProductNotFoundException when the product does not exist", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(fakeItem());
    findById.mockResolvedValue(undefined);

    await expect(
      service.execute("u1", "prod1", { quantity: 2 }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it("throws ProductUnavailableException when the product is inactive", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(fakeItem());
    findById.mockResolvedValue({ ...fakeProduct(), isActive: false });

    await expect(
      service.execute("u1", "prod1", { quantity: 2 }),
    ).rejects.toBeInstanceOf(ProductUnavailableException);
  });

  it("updates quantity refreshing the snapshot price and returns the cart", async () => {
    findCartByUserId.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(fakeItem());
    findById.mockResolvedValue(fakeProduct());
    updateItemQuantity.mockResolvedValue(fakeItem());
    getItemsWithProduct.mockResolvedValue([
      {
        item: { ...fakeItem(), quantity: 3 },
        product: fakeProduct(),
      },
    ]);

    const result = await service.execute("u1", "prod1", { quantity: 3 });

    expect(updateItemQuantity).toHaveBeenCalledWith("ci1", 3, "10.00");
    expect(result.items[0]!.quantity).toBe(3);
  });
});
