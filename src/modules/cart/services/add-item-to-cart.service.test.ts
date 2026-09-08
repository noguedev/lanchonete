import { describe, it, expect, vi, beforeEach } from "vitest";

import { AddItemToCartService } from "./add-item-to-cart.service.js";
import { ProductNotFoundException } from "../../product/exceptions/product-not-found.exception.js";
import { ProductUnavailableException } from "../exceptions/product-unavailable.exception.js";
import type { ProductRepository } from "../../product/product.repository.js";
import type { CartRepository } from "../cart.repository.js";
import type { Cart, CartItem, Product } from "../../../models/index.js";

const fakeProduct = (overrides: Partial<Product> = {}): Product => ({
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
  ...overrides,
});

const fakeCart = (): Cart => ({
  id: "cart1",
  userId: "u1",
  createdAt: new Date(),
  updatedAt: null,
});

const fakeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: "ci1",
  cartId: "cart1",
  productId: "prod1",
  quantity: 1,
  unitPrice: "10.00",
  createdAt: new Date(),
  updatedAt: null,
  ...overrides,
});

describe("AddItemToCartService", () => {
  let productRepo: ProductRepository;
  let cartRepo: CartRepository;
  let findById: ReturnType<typeof vi.fn>;
  let findOrCreateCart: ReturnType<typeof vi.fn>;
  let findItem: ReturnType<typeof vi.fn>;
  let addItem: ReturnType<typeof vi.fn>;
  let updateItemQuantity: ReturnType<typeof vi.fn>;
  let touchCart: ReturnType<typeof vi.fn>;
  let service: AddItemToCartService;

  beforeEach(() => {
    findById = vi.fn();
    findOrCreateCart = vi.fn();
    findItem = vi.fn();
    addItem = vi.fn();
    updateItemQuantity = vi.fn();
    touchCart = vi.fn().mockResolvedValue(undefined);

    productRepo = { findById } as unknown as ProductRepository;

    cartRepo = {
      findCartByUserId: vi.fn(),
      createCart: vi.fn(),
      findOrCreateCart,
      addItem,
      findItem,
      updateItemQuantity,
      removeItem: vi.fn(),
      getItemsWithProduct: vi.fn(),
      touchCart,
    } as unknown as CartRepository;

    service = new AddItemToCartService(productRepo, cartRepo);
  });

  it("throws ProductNotFoundException when the product does not exist", async () => {
    findById.mockResolvedValue(undefined);

    await expect(
      service.execute("u1", { productId: "prod1", quantity: 1 }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it("throws ProductUnavailableException when the product is inactive", async () => {
    findById.mockResolvedValue(fakeProduct({ isActive: false }));

    await expect(
      service.execute("u1", { productId: "prod1", quantity: 1 }),
    ).rejects.toBeInstanceOf(ProductUnavailableException);
  });

  it("throws ProductUnavailableException when the product is unavailable", async () => {
    findById.mockResolvedValue(fakeProduct({ isAvailable: false }));

    await expect(
      service.execute("u1", { productId: "prod1", quantity: 1 }),
    ).rejects.toBeInstanceOf(ProductUnavailableException);
  });

  it("creates a new cart item with the current product price as snapshot", async () => {
    findById.mockResolvedValue(fakeProduct());
    findOrCreateCart.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(undefined);
    addItem.mockResolvedValue(fakeItem());

    await service.execute("u1", { productId: "prod1", quantity: 2 });

    expect(findOrCreateCart).toHaveBeenCalledWith("u1");
    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: "cart1",
        productId: "prod1",
        quantity: 2,
        unitPrice: "10.00",
      }),
    );
    expect(touchCart).toHaveBeenCalledWith("cart1");
  });

  it("increments quantity when the item already exists, refreshing the snapshot price", async () => {
    findById.mockResolvedValue(fakeProduct({ price: "12.00" }));
    findOrCreateCart.mockResolvedValue(fakeCart());
    findItem.mockResolvedValue(fakeItem({ quantity: 1 }));
    updateItemQuantity.mockResolvedValue(fakeItem({ quantity: 3, unitPrice: "12.00" }));

    await service.execute("u1", { productId: "prod1", quantity: 2 });

    expect(updateItemQuantity).toHaveBeenCalledWith("ci1", 3, "12.00");
    expect(addItem).not.toHaveBeenCalled();
  });
});
