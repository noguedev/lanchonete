import { describe, it, expect, vi, beforeEach } from "vitest";

import { DeactivateProductService } from "./deactivate-product.service.js";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception.js";
import type { ProductRepository } from "../product.repository.js";
import type { Product } from "../../../models/index.js";

const fakeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Hambúrguer",
  slug: "hamburguer",
  description: null,
  price: "19.90",
  imageUrl: "/uploads/products/x.png",
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
  ...overrides,
});

describe("DeactivateProductService", () => {
  let findById: ReturnType<typeof vi.fn>;
  let setActive: ReturnType<typeof vi.fn>;
  let service: DeactivateProductService;

  beforeEach(() => {
    findById = vi.fn();
    setActive = vi.fn();

    const repository = {
      create: vi.fn(),
      findBySlug: vi.fn(),
      findById,
      listActive: vi.fn(),
      listActiveByCategory: vi.fn(),
      update: vi.fn(),
      setActive,
    } as unknown as ProductRepository;

    service = new DeactivateProductService(repository);
  });

  it("throws ProductNotFoundException when the product does not exist", async () => {
    findById.mockResolvedValue(undefined);

    await expect(service.execute("prod1")).rejects.toBeInstanceOf(
      ProductNotFoundException,
    );
  });

  it("sets isActive to false on success", async () => {
    findById.mockResolvedValue(fakeProduct());
    setActive.mockResolvedValue(fakeProduct({ isActive: false }));

    await service.execute("prod1");

    expect(setActive).toHaveBeenCalledWith("prod1", false);
  });
});
